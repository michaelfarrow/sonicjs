import mime from 'mime-types';
import fs from 'fs-extra';
import { TrackRepository } from '@/db';
import { Error } from '@/error';
import { libraryPath } from '@/utils/path';
import genericHandler from './generic';

export default genericHandler(
  (z) => ({
    id: z.string().uuid(),
  }),
  async ({ id }, next, res, req) => {
    const track = await TrackRepository.getById(id).toPromise();

    if (!track) {
      return next({
        code: Error.NotFound,
        message: 'Library item not found',
      });
    }

    const trackPath = libraryPath(track.path);

    const mimeType = mime.lookup(trackPath);

    if (!mimeType) {
      return next({
        code: Error.Generic,
        message: 'Library mime type not found',
      });
    }

    const stat = await fs.stat(trackPath);
    const total = stat.size;

    if (req.headers.range) {
      const range = req.headers.range;
      const [partialStart, partialEnd] = range.replace(/bytes=/, '').split('-');

      const start = parseInt(partialStart, 10);
      const end = partialEnd ? parseInt(partialEnd, 10) : total - 1;
      const chunkSize = end - start + 1;
      const readStream = fs.createReadStream(trackPath, {
        start: start,
        end: end,
      });
      res.writeHead(206, {
        'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mimeType,
      });
      readStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': total,
        'Content-Type': mimeType,
      });
      fs.createReadStream(trackPath).pipe(res);
    }
  }
);
