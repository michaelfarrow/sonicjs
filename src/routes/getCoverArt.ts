import { NextFunction, Request, Response } from 'express';
import { item, images } from '../library';
import { Error } from '../error';

export default function getCoverArt(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { id, size } = req.query;
  const libraryItem = item(id as string);

  if (!libraryItem) {
    return next({
      code: Error.NotFound,
      message: 'Library item not found',
    });
  }

  const itemImages = images(libraryItem);
  const coverImage = itemImages.find((i) => i.name === 'cover');
  const posterImage = itemImages.find((i) => i.name === 'poster');

  if (!coverImage && !posterImage) {
    return next({
      code: Error.NotFound,
      message: 'Image not found',
    });
  }

  // TODO: resize

  res.sendFile((posterImage?.path || coverImage?.path) as string);
}
