import fs from 'fs-extra';
import sharp from 'sharp';
import path from 'path';
import { ImageRepository } from '@/db';
import { Error } from '@/error';
import { imagePath, libraryPath } from '@/utils/path';
import genericHandler from './generic';

export default genericHandler(
  (z) => ({
    id: z.string(), // TODO: regex
    size: z.coerce.number().int().min(10).optional(),
  }),
  async ({ id: idHash, size }, next, res) => {
    const [id, hash] = idHash.split(/\|/);

    const image = await ImageRepository.getById(id)
      .where((i) => i.hash)
      .equal(hash);

    if (!image) {
      return next({
        code: Error.NotFound,
        message: 'Image not found',
      });
    }

    const cacheDir = imagePath(image.hash);
    const cacheFilename = size !== undefined ? `${size}.jpg` : 'original.jpg';
    const cachePath = path.resolve(cacheDir, cacheFilename);

    if (await fs.pathExists(cachePath)) {
      res.sendFile(cachePath);
    } else {
      const img = sharp(libraryPath(image.path));
      img.jpeg({ quality: 80 });
      img.on('error', () => {}); // TODO: Handle errors properly
      if (size !== undefined) img.resize(Number(size), Number(size));
      await fs.ensureDir(cacheDir);
      await img.toFile(cachePath);
      res.sendFile(cachePath);
    }
  }
);
