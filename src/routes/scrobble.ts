import genericHandler from './generic';
import srobble from '@/scrobbler';

export default genericHandler(
  (z) => ({
    id: z.union([z.string().uuid(), z.string().uuid().array()]),
  }),
  async ({ id }, next, res) => {
    srobble(id);

    res.locals = { empty: true };
    next();
  }
);
