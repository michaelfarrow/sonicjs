import { NextFunction, Request, Response } from 'express';
import mime from 'mime-types';
import fs from 'fs-extra';
import { track } from '../library';
import { Error as ErrorCodes } from '../error';

export default async function getCoverArt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.query;
  const libraryTrack = await track(id as string);

  if (!libraryTrack) {
    return next({
      code: ErrorCodes.NotFound,
      message: 'Library item not found',
    });
  }

  const mimeType = mime.lookup(libraryTrack.path);

  if (!mimeType) {
    return next({
      code: ErrorCodes.Generic,
      message: 'Library mime type not found',
    });
  }

  var stat = await fs.stat(libraryTrack.path);
  var total = stat.size;

  if (req.headers.range) {
    var range = req.headers.range;
    var parts = range.replace(/bytes=/, '').split('-');
    var partialstart = parts[0];
    var partialend = parts[1];

    var start = parseInt(partialstart, 10);
    var end = partialend ? parseInt(partialend, 10) : total - 1;
    var chunksize = end - start + 1;
    var readStream = fs.createReadStream(libraryTrack.path, {
      start: start,
      end: end,
    });
    res.writeHead(206, {
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mimeType,
    });
    readStream.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': total,
      'Content-Type': mimeType,
    });
    fs.createReadStream(libraryTrack.path).pipe(res);
  }
}
