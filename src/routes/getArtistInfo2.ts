import _ from 'lodash';
import { ArtistInfo2 } from '@/types';
import { ArtistRepository } from '@/db';
import { Error } from '@/error';
import genericHandler from './generic';
import { artistResponse } from '@/api-response';
import Artist from '@/models/Artist';

export type GetArtistInfo2Response = {
  artistInfo2: ArtistInfo2;
};

function artistGenresIds(artist: Artist) {
  return _(artist.albums)
    .map((a) => a.genres)
    .flatten()
    .map((g) => g.id)
    .uniq()
    .value();
}

export default genericHandler(
  (z) => ({
    id: z.string().uuid(),
  }),
  async ({ id }, next, res) => {
    const artist = await ArtistRepository.getById(id)
      .include((a) => a.albums)
      .thenInclude((album) => album.genres)
      .toPromise();

    if (!artist) {
      return next({
        code: Error.NotFound,
        message: 'Artist not found',
      });
    }

    const genreIds = artistGenresIds(artist);

    const genreArtists = await ArtistRepository.getAll()
      .where((a) => a.id)
      .notEqual(artist.id)
      .and((a) => a.item)
      .notEqual('Various Artists')
      .include((a) => a.image)
      .include((a) => a.albums)
      .thenInclude((album) => album.genres)
      .join((a) => a.albums)
      .thenJoin((album) => album.genres)
      .where((g) => g.id)
      .in([...genreIds])
      .toPromise();

    const response: GetArtistInfo2Response = {
      artistInfo2: {
        biography: artist.bio || undefined,
        musicBrainzId: artist.mbid || undefined,
        similarArtist: _(genreArtists)
          .sortBy(
            (genreArtist) =>
              artistGenresIds(genreArtist).filter((id) => genreIds.includes(id))
                .length * -1
          )
          .map((artist) => artistResponse(artist))
          .value(),
      },
    };

    res.locals = response;
    next();
  }
);
