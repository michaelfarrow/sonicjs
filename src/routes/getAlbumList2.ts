import { NextFunction, Request, Response } from 'express';
import { AlbumID3 } from '../types';
import { allAlbums, images } from '../library';
import { albumResponse } from '../api-response';

export type GetAlbumList2Response = {
  albumList2: {
    album: AlbumID3[];
  };
};

export default async function getAlbumList2(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const libAlbums = await allAlbums();

  const albums: AlbumID3[] = [];

  for (const album of libAlbums) {
    albums.push(await albumResponse(album));
  }

  const response: any = {
    albumList2: {
      album: albums,
    },
  };

  res.locals = response;
  next();
}
