import { ArtistRepository, AlbumRepository, TrackRepository } from '@/db';
import { Error } from '@/error';
import genericHandler from './generic';
import Artist from '@/models/Artist';
import Album from '@/models/Album';
import Track from '@/models/Track';

export default function (star: boolean) {
  return genericHandler(
    (z) => ({
      id: z.string().uuid().optional(),
      artistId: z.string().uuid().optional(),
      albumId: z.string().uuid().optional(),
    }),
    async ({ id, artistId, albumId }, next, res) => {
      let item: Artist | Album | Track | null = null;

      if (artistId)
        item = await ArtistRepository.getById(artistId)
          .toPromise()
          .catch((e) => {
            throw e;
          });
      if (albumId)
        item = await AlbumRepository.getById(albumId)
          .toPromise()
          .catch((e) => {
            throw e;
          });
      if (id)
        item = await TrackRepository.getById(id)
          .toPromise()
          .catch((e) => {
            throw e;
          });

      if (!item) {
        return next({
          code: Error.NotFound,
          message: 'Item not found',
        });
      }

      item.starred = star ? new Date() : null;
      await item.save();

      res.locals = { empty: true };
      next();
    }
  );
}
