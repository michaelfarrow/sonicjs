import { TrackRepository } from '@/db';
import { Error } from '@/error';
import genericHandler from './generic';

export default genericHandler(
  (z) => ({
    id: z.string().uuid(),
    rating: z.coerce.number().min(0).max(5),
  }),
  async ({ id, rating }, next, res) => {
    const track = await TrackRepository.getById(id)
      .toPromise()
      .catch((e) => {
        throw e;
      });

    if (!track) {
      return next({
        code: Error.NotFound,
        message: 'Track not found',
      });
    }

    track.rating = rating;
    await track.save();

    res.locals = { empty: true };
    next();
  }
);
