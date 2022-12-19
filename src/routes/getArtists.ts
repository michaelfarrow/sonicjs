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

export default async function getArtists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const artists = await allArtists();

  const response: GetArtistsResponse = {
    artists: {
      ignoredArticles: 'The El La Los Las Le Les',
      index: [
        // TODO: Alpha index
        {
          name: 'All',
          artist: await Promise.all(
            artists.map(async (artist) => {
              const artistImages = images(artist);
              const artistAlbums = await albums(artist);
              return {
                id: artist.id,
                name: artist.meta?.name || artist.name,
                albumCount: artistAlbums.length,
                coverArt:
                  // TODO: standardise valid names
                  (artistImages.find((image) =>
                    ['poster', 'cover'].includes(image.name)
                  )?.path &&
                    artist.id) ||
                  undefined,
              };
            })
          ),
        },
      ],
    },
  };

  res.locals = response;
  next();
}
