import { AlbumList2 } from '@/types';
import { AlbumRepository } from '@/db';
import { albumResponse } from '@/api-response';
import genericHandler from './generic';

export type GetAlbumList2Response = {
  albumList2: AlbumList2;
};

export default genericHandler(
  (z) => ({
    type: z.enum([
      'random',
      'newest',
      'frequent',
      'recent',
      'starred',
      'alphabeticalByName',
      'alphabeticalByArtist',
      'byYear',
      'byGenre',
    ]),
    size: z.coerce.number().int().min(1).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    fromYear: z.coerce.number().int().min(0).optional(),
    toYear: z.coerce.number().int().min(0).optional(),
    genre: z.string().optional(),
  }),
  async ({ type, size, offset, fromYear, toYear, genre }, next, res) => {
    const query = AlbumRepository.getAll();

    if (size) query.take(size);
    if (offset) query.skip(offset);

    switch (type) {
      case 'newest':
        query.orderByDescending((a) => a.createdAt);
        break;
      case 'frequent':
        query
          .where((a) => a.plays)
          .notEqual(0)
          .orderByDescending((a) => a.plays);
        break;
      case 'recent':
        query
          .where((a) => a.plays)
          .notEqual(0)
          .orderByDescending((a) => a.lastPlayed);
        break;
      case 'starred':
        query.orderByDescending((a) => a.starred);
        break;
      case 'alphabeticalByName':
        query.orderBy((a) => a.sortName);
        break;
      case 'alphabeticalByArtist':
        query.include((a) => a.artist).orderBy((a) => a.sortName);
        break;
      case 'byYear':
        if (fromYear && toYear) {
          query
            .where((a) => a.year!)
            .greaterThanOrEqual(fromYear)
            .and((a) => a.year!)
            .lessThanOrEqual(toYear);
        } else {
          if (fromYear)
            query.where((a) => a.year!).greaterThanOrEqual(fromYear);
          if (toYear) query.where((a) => a.year!).lessThanOrEqual(toYear);
        }
        query.orderBy((a) => a.year);
        break;
      case 'byGenre':
        query
          .orderBy((a) => a.sortName)
          .join((a) => a.genres)
          .where((g) => g.name)
          .equal(genre || '');
        break;
      default:
        query.orderBy((a) => a.rand);
        break;
    }

    query.include((a) => a.image).include((a) => a.artist);

    const albums = await query.toPromise();

    const response: GetAlbumList2Response = {
      albumList2: {
        album: albums.map((album) => albumResponse(album)),
      },
    };

    res.locals = response;
    next();
  }
);
