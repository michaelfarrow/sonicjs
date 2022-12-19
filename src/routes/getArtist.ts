import { NextFunction, Request, Response } from 'express';
import { ArtistWithAlbumsID3 } from '../types';
import { artist, albums, images } from '../library';
import { Error } from '../error';

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

  const artistAlbums = await albums(libArtist);
  const artistImages = images(libArtist);

  const response: GetArtistResponse = {
    artist: {
      id: _id,
      albumCount: artistAlbums.length,
      name: libArtist.meta?.name || libArtist.name,
      coverArt:
        (artistImages.find((image) => ['poster', 'cover'].includes(image.name))
          ?.path &&
          _id) ||
        undefined,
      // starred: false,
      album: artistAlbums.map((album) => {
        const albumImages = images(album);
        return {
          id: album.id,
          name: album.meta?.title || album.name,
          created: new Date(),
          duration: 0,
          songCount: 0,
          artist: artist.name,
          artistId: _id,
          coverArt:
            (albumImages.find((image) =>
              ['poster', 'cover'].includes(image.name)
            )?.path &&
              album.id) ||
            undefined,
        };
      }),
    },
  };

  res.locals = response;
  next();
}
