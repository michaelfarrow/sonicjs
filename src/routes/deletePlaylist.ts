import { Error } from '@/error';
import genericHandler from './generic';
import { PlaylistRepository } from '@/db';

export default genericHandler(
  (z) => ({
    id: z.coerce.number(),
  }),
  async ({ id }, next, res) => {
    const playlist = await PlaylistRepository.getById(id)
      .toPromise()
      .catch((e) => {
        throw e;
      });

    if (!playlist) {
      return next({
        code: Error.NotFound,
        message: 'playlist not found',
      });
    }

    await playlist.remove();

    res.locals = { empty: true };
    next();
  }
);
