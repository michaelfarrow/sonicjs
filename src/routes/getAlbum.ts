import { AlbumWithSongsID3 } from '@/types';
import { AlbumRepository } from '@/db';
import { albumWithSongsResponse } from '@/api-response';
import { Error } from '@/error';
import genericHandler from './generic';

export type GetAlbumResponse = {
  album: AlbumWithSongsID3;
};

export default genericHandler(
  (z) => ({
    id: z.string().uuid(),
  }),
  async ({ id }, next, res) => {
    const album = await AlbumRepository.getById(id)
      .include((a) => a.artist)
      .include((a) => a.image)
      .include((a) => a.tracks)
      .orderBy((track) => track.disc)
      .thenBy((track) => track.track)
      .thenBy((track) => track.name)
      .toPromise()
      .catch((e) => {
        throw e;
      });

    if (!album) {
      return next({
        code: Error.NotFound,
        message: 'Album not found',
      });
    }

    const response: GetAlbumResponse = {
      album: albumWithSongsResponse(album),
    };

    res.locals = response;
    next();
  }
);
