import { Error } from '@/error';
import { PlaylistRepository } from '@/db';
import { PlaylistWithSongs } from '@/types';
import { playlistWithSongsResponse } from '@/api-response';
import genericHandler from './generic';

export type GetPlaylistResponse = {
  playlist: PlaylistWithSongs;
};

export default genericHandler(
  (z) => ({
    id: z.coerce.number(),
  }),
  async ({ id }, next, res) => {
    const playlist = await PlaylistRepository.getById(id)
      .include((p) => p.tracks)
      .orderByDescending((playlistTrack) => playlistTrack.id)
      .include((p) => p.tracks)
      .thenInclude((playlistTrack) => playlistTrack.track)
      .thenInclude((track) => track.album)
      .thenInclude((album) => album.artist)
      .include((p) => p.tracks)
      .thenInclude((playlistTrack) => playlistTrack.track)
      .thenInclude((track) => track.album)
      .thenInclude((album) => album.image!);

    if (!playlist) {
      return next({
        code: Error.NotFound,
        message: 'playlist not found',
      });
    }

    const response: GetPlaylistResponse = {
      playlist: playlistWithSongsResponse(playlist),
    };

    res.locals = response;
    next();
  }
);
