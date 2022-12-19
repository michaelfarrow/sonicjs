import { NextFunction, Request, Response } from 'express';
import { AlbumWithSongsID3 } from '../types';
import { album } from '../library';
import { albumWithSongsResponse } from '../api-response';
import { Error } from '../error';

export type GetAlbumResponse = {
  album: AlbumWithSongsID3;
};

export default async function getArtist(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.query;
  const _id = (id || '') as string;

  const libAlbum = await album(_id);

  if (!libAlbum) {
    return next({
      code: Error.NotFound,
      message: 'Album not found',
    });
  }

  const response: GetAlbumResponse = {
    album: await albumWithSongsResponse(libAlbum),
  };

  res.locals = response;
  next();
}
