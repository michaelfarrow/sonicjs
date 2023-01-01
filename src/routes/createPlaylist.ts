import { Error } from '@/error';
import genericHandler from './generic';
import Playlist from '@/models/Playlist';
import { PlaylistRepository, TrackRepository } from '@/db';
import PlaylistTrack from '@/models/PlaylistTrack';

export default genericHandler(
  (z) => ({
    playlistId: z.coerce.number().optional(),
    name: z.string().optional(),
    songId: z.union([z.string(), z.string().array()]).optional(),
  }),
  async ({ playlistId, name, songId }, next, res) => {
    if (!playlistId && !name) {
      return next({
        code: Error.RequiredParamMissing,
        message: 'playlistId or name param required',
      });
    }

    let playlist: Playlist | null = null;

    if (playlistId) {
      playlist = await PlaylistRepository.getById(playlistId).toPromise();
    } else {
      playlist = new Playlist();
    }

    if (!playlist) {
      return next({
        code: Error.NotFound,
        message: 'playlist not found',
      });
    }

    if (name !== undefined) playlist.name = name;

    await playlist.save();

    if (songId) {
      const _songId = Array.isArray(songId) ? songId : [songId];
      const tracks = await TrackRepository.getAll()
        .where((t) => t.id)
        .in(_songId)
        .toPromise();
      const playlistTracks: PlaylistTrack[] = [];

      for (const track of tracks) {
        const playlistTrack = new PlaylistTrack();
        playlistTrack.playlist = playlist;
        playlistTrack.track = track;
        await playlistTrack.save();

        playlistTracks.push(playlistTrack);
      }

      playlist.tracks = playlistTracks;
    }

    await playlist.save();

    res.locals = { empty: true };
    next();
  }
);
