import { NextFunction, Request, Response } from 'express';
import { AlbumID3, ArtistID3, Child, SearchResult3 } from '../types';
import { filteredItems, attachMetadataMultiple } from '../library';
import { artistResponse, albumResponse, trackResponse } from '../api-response';

export type SearchResult3Response = {
  searchResult3: SearchResult3;
};

export default async function search3(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {
    query,
    artistOffset = '0',
    artistCount = '0',
    albumOffset = '0',
    albumCount = '0',
    songOffset = '0',
    songCount = '0',
  } = req.query;

  const _query =
    !query || !query.length || query === '""' ? null : (query as string);

  const _artistOffset = Number(artistOffset);
  const _artistCount = Number(artistCount);

  const _albumOffset = Number(albumOffset);
  const _albumCount = Number(albumCount);

  const _songOffset = Number(songOffset);
  const _songCount = Number(songCount);

  const searchAll = !_artistCount && !_albumOffset && !_songCount;

  const response: SearchResult3Response = {
    searchResult3: {},
  };

  if (_artistCount || searchAll) {
    const libArtists = await attachMetadataMultiple(
      filteredItems('artist').slice(
        _artistOffset,
        _artistOffset + (searchAll ? 10 : _artistCount)
      )
    );
    const resArtists: ArtistID3[] = [];

    for (const artist of libArtists) {
      resArtists.push(await artistResponse(artist));
    }

    response.searchResult3.artist = resArtists;
  }

  if (_albumCount || searchAll) {
    const libAlbums = await attachMetadataMultiple(
      filteredItems('album').slice(
        _albumOffset,
        _albumOffset + (searchAll ? 10 : _albumCount)
      )
    );
    const resAlbums: AlbumID3[] = [];

    for (const album of libAlbums) {
      resAlbums.push(await albumResponse(album));
    }

    response.searchResult3.album = resAlbums;
  }

  if (_songCount || searchAll) {
    const libSongs = await attachMetadataMultiple(
      filteredItems('track').slice(
        _songOffset,
        _songOffset + (searchAll ? 10 : _songCount)
      )
    );
    const resSongs: Child[] = [];

    for (const song of libSongs) {
      resSongs.push(await trackResponse(song));
    }

    response.searchResult3.song = resSongs;
  }

  res.locals = response;
  next();
}
