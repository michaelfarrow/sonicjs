import { NextFunction, Request, Response } from 'express';
import { ArtistWithAlbumsID3 } from '../types';
import { item, albums, images } from '../library';
import { Error } from '../error';

export type GetArtistResponse = {
  artist: ArtistWithAlbumsID3;
};

export default function getArtist(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { id } = req.query;
  const _id = (id || '') as string;

  const artist = item(_id, 'artist');

  if (!artist) {
    return next({
      code: Error.NotFound,
      message: 'Artist not found',
    });
  }

  const artistAlbums = albums(artist);
  const artistImages = images(artist);

  const response: GetArtistResponse = {
    artist: {
      id: _id,
      albumCount: artistAlbums.length,
      name: artist.name,
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
          name: album.name,
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
