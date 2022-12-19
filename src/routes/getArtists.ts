import { NextFunction, Request, Response } from 'express';
import { ArtistID3 } from '../types';
import { allArtists } from '../library';

import { artistResponse } from '../api-response';

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
  const libArtists = await allArtists();
  const artists: ArtistID3[] = [];

  for (const artist of libArtists) {
    artists.push(await artistResponse(artist));
  }

  const response: GetArtistsResponse = {
    artists: {
      ignoredArticles: 'The El La Los Las Le Les',
      index: [
        // TODO: Alpha index
        {
          name: 'All',
          artist: artists,
        },
      ],
    },
  };

  res.locals = response;
  next();
}
