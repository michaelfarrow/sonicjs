import { Error } from '@/error';
import genericHandler from './generic';
import { PlaylistRepository, TrackRepository } from '@/db';
import PlaylistTrack from '@/models/PlaylistTrack';

export default genericHandler(
  (z) => ({
    playlistId: z.coerce.number(),
    name: z.string().optional(),
    comment: z.string().optional(),
    public: z.string().optional(),
    songIdToAdd: z.union([z.string(), z.string().array()]).optional(),
    songIndexToRemove: z
      .union([z.coerce.number(), z.coerce.number().array()])
      .optional(),
  }),
  async (
    {
      playlistId,
      name,
      comment,
      public: isPublic,
      songIdToAdd,
      songIndexToRemove,
    },
    next,
    res
  ) => {
    const playlist = await PlaylistRepository.getById(playlistId)
      .include((p) => p.tracks)
      .toPromise();

    if (!playlist) {
      return next({
        code: Error.NotFound,
        message: 'playlist not found',
      });
    }

    const existingTracks = playlist.tracks.map((t) => t.trackId);

    if (name !== undefined) playlist.name = name;
    if (comment !== undefined) playlist.comment = comment;
    if (isPublic !== undefined)
      playlist.public = isPublic.toLowerCase().trim() === 'true';

    if (songIdToAdd) {
      const _songIdToAdd = (
        Array.isArray(songIdToAdd) ? songIdToAdd : [songIdToAdd]
      ).filter((song) => !existingTracks.includes(song));

      const tracksToAdd = await TrackRepository.getAll()
        .where((t) => t.id)
        .in(_songIdToAdd)
        .toPromise();

      for (const trackToAdd of tracksToAdd) {
        const playlistTrack = new PlaylistTrack();
        playlistTrack.playlist = playlist;
        playlistTrack.track = trackToAdd;
        await playlistTrack.save();

        playlist.tracks.push(playlistTrack);
      }
    }

    if (songIndexToRemove !== undefined) {
      const _songIndexToRemove = Array.isArray(songIndexToRemove)
        ? songIndexToRemove
        : [songIndexToRemove];

      for (let i = 0; i < playlist.tracks.length; i++) {
        if (_songIndexToRemove.includes(i)) playlist.tracks[i].remove();
      }

      playlist.tracks = playlist.tracks.filter(
        ({}, i) => !_songIndexToRemove.includes(i)
      );
    }

    await playlist.save();

    res.locals = { empty: true };
    next();
  }
);
