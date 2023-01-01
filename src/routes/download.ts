import archiver from 'archiver';
import fs from 'fs-extra';
import path from 'path';
import { AlbumRepository, TrackRepository } from '@/db';
import { Error } from '@/error';
import { libraryPath } from '@/utils/path';
import genericHandler from './generic';

export default genericHandler(
  (z) => ({
    id: z.string().uuid(),
  }),
  async ({ id }, next, res) => {
    const album = await AlbumRepository.getById(id)
      .include((a) => a.artist)
      .include((a) => a.tracks)
      .toPromise()
      .catch((e) => {
        throw e;
      });
    const track = await TrackRepository.getById(id)
      .toPromise()
      .catch((e) => {
        throw e;
      });

    if (!track && !album) {
      return next({
        code: Error.NotFound,
        message: 'Library item not found',
      });
    }

    if (track) {
      return res.download(libraryPath(track.path));
    }

    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-disposition': `attachment; filename=${path.basename(
        album.artist.path
      )} - ${path.basename(album.path)}.zip`,
    });

    const zip = archiver('zip');

    zip.pipe(res);

    for (const track of album.tracks) {
      zip.append(fs.createReadStream(libraryPath(track.path)), {
        name: path.basename(track.path),
      });
    }

    zip.finalize();
  }
);
