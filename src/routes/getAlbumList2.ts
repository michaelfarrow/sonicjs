import { NextFunction, Request, Response } from 'express';
import { AlbumID3 } from '../types';
import { allAlbums, images } from '../library';

export type GetAlbumList2Response = {
  albumList2: {
    album: AlbumID3[];
  };
};

export default function getAlbumList2(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const response: any = {
    albumList2: {
      album: allAlbums().map(([id, album]) => {
        const albumImages = images(album);
        return {
          id: id,
          name: album.name,
          // artist: 'Test',
          artistId: album.parent,
          coverArt:
            (albumImages.find((image) =>
              ['poster', 'cover'].includes(image.name)
            )?.path &&
              id) ||
            undefined,
          songCount: 2,
          created: new Date(),
          duration: 514,
          // starred: false,
        };
      }),
    },
  };

  res.locals = response;
  next();
}
