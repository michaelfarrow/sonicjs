import { Request, Response, NextFunction } from 'express';
import { LinqRepository } from 'typeorm-linq-repository';
import { Starred2 } from '@/types';
import { ArtistRepository, AlbumRepository, TrackRepository } from '@/db';
import { albumResponse, artistResponse, trackResponse } from '@/api-response';
import Artist from '@/models/Artist';
import Album from '@/models/Album';
import Track from '@/models/Track';

export type GetStarred2Response = {
  starred2: Starred2;
};

function getStarred<T extends Artist | Album | Track>(repo: LinqRepository<T>) {
  return repo
    .getAll()
    .where((a) => a.starred!)
    .isNotNull()
    .orderBy((a) => a.starred);
}

export default async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const albums = await getStarred(AlbumRepository)
    .include((a) => a.artist)
    .include((a) => a.image)
    .include((a) => a.tracks)
    .toPromise();

  const artists = await getStarred(ArtistRepository)
    .include((a) => a.image)
    .include((a) => a.albums)
    .toPromise();

  const tracks = await getStarred(TrackRepository)
    .include((a) => a.album)
    .thenInclude((album) => album.artist)
    .include((a) => a.album)
    .thenInclude((album) => album.image!)
    .toPromise();

  const response: GetStarred2Response = {
    starred2: {
      album: albums.map((album) => albumResponse(album)),
      artist: artists.map((artist) => artistResponse(artist)),
      song: tracks.map((track) => trackResponse(track)),
    },
  };

  res.locals = response;
  next();
}
