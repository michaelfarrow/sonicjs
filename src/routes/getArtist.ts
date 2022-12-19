import { NextFunction, Request, Response } from 'express';
import { ArtistWithAlbumsID3 } from '../types';
import { artist } from '../library';
import { Error } from '../error';
import { artistWithAlbumsResponse } from '../api-response';

export type GetArtistResponse = {
  artist: ArtistWithAlbumsID3;
};

export default async function getArtist(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.query;
  const _id = (id || '') as string;

  const libArtist = await artist(_id);

  if (!libArtist) {
    return next({
      code: Error.NotFound,
      message: 'Artist not found',
    });
  }

  const response: GetArtistResponse = {
    artist: await artistWithAlbumsResponse(libArtist),
  };

  res.locals = response;
  next();
}
