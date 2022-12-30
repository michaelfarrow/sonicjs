import { LinqRepository } from 'typeorm-linq-repository';
import { SearchResult3 } from '@/types';
import genericHandler from './generic';
import { albumResponse, artistResponse, trackResponse } from '@/api-response';
import { ArtistRepository, AlbumRepository, TrackRepository } from '@/db';
import Artist from '@/models/Artist';
import Album from '@/models/Album';
import Track from '@/models/Track';

export type SearchResult3Response = {
  searchResult3: SearchResult3;
};

function searchAll<T extends Artist | Album | Track>(
  repo: LinqRepository<T>,
  query: string,
  count: number,
  offset: number
) {
  return repo
    .getAll()
    .where((a) => a.name!)
    .contains(query)
    .or((a) => a.item)
    .contains(query)
    .take(count)
    .skip(offset);
}

export default genericHandler(
  (z) => ({
    query: z.string(),
    artistCount: z.coerce.number().int().min(0).optional(),
    artistOffset: z.coerce.number().int().min(0).optional(),
    albumCount: z.coerce.number().int().min(0).optional(),
    albumOffset: z.coerce.number().int().min(0).optional(),
    songCount: z.coerce.number().int().min(0).optional(),
    songOffset: z.coerce.number().int().min(0).optional(),
  }),
  async (
    {
      query,
      artistCount = 20,
      artistOffset = 0,
      albumCount = 20,
      albumOffset = 0,
      songCount = 20,
      songOffset = 0,
    },
    next,
    res
  ) => {
    // Symfonium scan fix
    const _query = query.replace(/^"(.*?)"$/, '$1');

    const artists = await searchAll(
      ArtistRepository,
      _query,
      artistCount,
      artistOffset
    )
      .include((a) => a.albums)
      .include((a) => a.image);

    const albums = await searchAll(
      AlbumRepository,
      _query,
      albumCount,
      albumOffset
    )
      .include((a) => a.artist)
      .include((a) => a.image);

    const tracks = await searchAll(
      TrackRepository,
      _query,
      songCount,
      songOffset
    )
      .include((a) => a.album)
      .thenInclude((album) => album.artist)
      .include((a) => a.album)
      .thenInclude((album) => album.image!);

    const response: SearchResult3Response = {
      searchResult3: {
        artist: artists.map((artist) => artistResponse(artist)),
        album: albums.map((album) => albumResponse(album)),
        song: tracks.map((track) => trackResponse(track)),
      },
    };

    res.locals = response;
    next();
  }
);
