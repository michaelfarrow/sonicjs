import { ArtistWithAlbumsID3 } from '@/types';
import { ArtistRepository } from '@/db';
import { artistWithAlbumsResponse } from '@/api-response';
import { Error } from '@/error';
import genericHandler from './generic';

export type GetArtistResponse = {
  artist: ArtistWithAlbumsID3;
};

export default genericHandler(
  (z) => ({
    id: z.string().uuid(),
  }),
  async ({ id }, next, res) => {
    const artist = await ArtistRepository.getById(id)
      .include((a) => a.image)
      .include((a) => a.albums)
      .orderBy((album) => album.year)
      .thenInclude((album) => album.tracks)
      .include((a) => a.albums)
      .thenInclude((album) => album.image!)
      .toPromise()
      .catch((e) => {
        throw e;
      });

    if (!artist) {
      return next({
        code: Error.NotFound,
        message: 'Artist not found',
      });
    }

    const response: GetArtistResponse = {
      artist: artistWithAlbumsResponse(artist),
    };

    res.locals = response;
    next();
  }
);
