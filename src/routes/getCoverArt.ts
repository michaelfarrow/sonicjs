import { NextFunction, Request, Response } from 'express';
import fs from 'fs-extra';
import sharp from 'sharp';
import path from 'path';
import { item, images, LibraryItem } from '../library';
import { Error as ErrorCodes } from '../error';
import { imagePath } from '../utils/path';

export default async function getCoverArt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id, size } = req.query;
  const libraryItem = item(id as string);

  const hasSize = !!(size && !isNaN(Number(size)));

  if (!libraryItem) {
    return next({
      code: ErrorCodes.NotFound,
      message: 'Library item not found',
    });
  }

  const itemImages = images(libraryItem);
  const coverImage = itemImages.find((i) => i.name === 'cover');
  const posterImage = itemImages.find((i) => i.name === 'poster');

  if (!coverImage && !posterImage) {
    return next({
      code: ErrorCodes.NotFound,
      message: 'Image not found',
    });
  }

  const image = (posterImage || coverImage) as LibraryItem;
  const { path: p, id: imageId } = image;

  const cacheDir = imagePath(imageId);
  const cacheFilename = hasSize ? `${size}.jpg` : 'original.jpg';
  const cachePath = path.resolve(cacheDir, cacheFilename);

  if (await fs.pathExists(cachePath)) {
    res.sendFile(cachePath);
  } else {
    const img = await sharp(p);
    img.jpeg({ quality: 80 });

    img.on('error', () => {}); // TODO: Handle errors properly

    if (hasSize) await img.resize(Number(size), Number(size));
    await fs.ensureDir(cacheDir);
    await img.toFile(cachePath);

    res.sendFile(cachePath);
  }
}
