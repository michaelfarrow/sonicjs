import { Request, Response, NextFunction } from 'express';
import { PlaylistRepository } from '@/db';
import { Playlists } from '@/types';
import { playlistResponse } from '@/api-response';

export type GetPlaylistsResponse = {
  playlists: Playlists;
};

export default async function getPlaylists(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const playlists = await PlaylistRepository.getAll()
    .orderBy((p) => p.updatedAt)
    .include((p) => p.tracks)
    .thenInclude((playlistTrack) => playlistTrack.track)
    .toPromise()
    .catch((e) => {
      throw e;
    });

  const response: GetPlaylistsResponse = {
    playlists: {
      playlist: playlists.map((playlist) => playlistResponse(playlist)),
    },
  };

  res.locals = response;
  next();
}
