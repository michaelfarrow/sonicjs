import { NextFunction, Request, Response } from 'express';
import { AlbumID3 } from '../types';
import { allAlbums, images } from '../library';

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
  const albums = await allAlbums();

  const response: any = {
    albumList2: {
      album: albums.map((album) => {
        const albumImages = images(album);
        return {
          id: album.id,
          name: album.meta?.title || album.name,
          // artist: 'Test',
          artistId: album.parent,
          coverArt:
            (albumImages.find((image) =>
              ['poster', 'cover'].includes(image.name)
            )?.path &&
              album.id) ||
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
