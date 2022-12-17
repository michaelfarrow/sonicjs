import { NextFunction, Request, Response } from 'express';
import { ArtistID3 } from '../types';
import { allArtists, albums, images } from '../library';

export type GetArtistsResponse = {
  artists: {
    ignoredArticles: string;
    index: {
      name: string;
      artist: ArtistID3[];
    }[];
  };
};

export default function getArtists(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const response: GetArtistsResponse = {
    artists: {
      ignoredArticles: 'The El La Los Las Le Les',
      index: [
        // TODO: Alpha index
        {
          name: 'All',
          artist: allArtists().map(([id, artist]) => {
            const artistImages = images(artist);
            const artistAlbums = albums(artist);
            return {
              id: id,
              name: artist.name,
              albumCount: artistAlbums.length,
              coverArt:
                // TODO: standardise valid names
                (artistImages.find((image) =>
                  ['poster', 'cover'].includes(image.name)
                )?.path &&
                  id) ||
                undefined,
            };
          }),
        },
      ],
    },
  };

  res.locals = response;
  next();
}
