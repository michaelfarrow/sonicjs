import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import { IGNORED_ARTICLES } from '@/config';
import { ignoredArticlesRegex } from '@/utils/library';
import { ArtistsID3 } from '@/types';
import { ArtistRepository } from '@/db';
import { artistResponse } from '@/api-response';

export type GetArtistsResponse = {
  artists: ArtistsID3;
};

export default async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const artists = await ArtistRepository.getAll()
    .orderBy((a) => a.sortName)
    .include((a) => a.image)
    .include((a) => a.albums)
    .toPromise();

  const indexedArtists = artists.reduce<{
    [key: string]: { group: string; artists: typeof artists };
  }>((index, artist) => {
    const group = artist.sortName
      .toUpperCase()
      .replace(ignoredArticlesRegex, '')[0];

    if (!index[group]) index[group] = { group, artists: [] };
    index[group].artists.push(artist);

    return index;
  }, {});

  const response: GetArtistsResponse = {
    artists: {
      ignoredArticles: IGNORED_ARTICLES.join(' '),
      index: _.sortBy(Object.values(indexedArtists), 'group').map(
        (indexedArtist) => ({
          name: indexedArtist.group,
          artist: indexedArtist.artists.map(artistResponse),
        })
      ),
    },
  };

  res.locals = response;
  next();
}
