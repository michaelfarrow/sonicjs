import { default as queueLib } from 'queue';
import { TrackRepository } from '@/db';

const CONCURRENCY = 1;

export const q = queueLib({ concurrency: CONCURRENCY, autostart: true });

q.on('error', (error) => {
  console.log('scrobble job error');
  console.error(error);
});

q.on('end', (error) => {
  error && console.error(error);
});

export default function srobble(id: string | string[]) {
  q.push(async () => {
    const tracks = await TrackRepository.getAll()
      .where((t) => t.id)
      .in(Array.isArray(id) ? id : [id])
      .include((a) => a.album);

    const played = new Date();

    for (const track of tracks) {
      // TODO: Songs from same album only inc album count by one
      if (
        track.lastPlayed === null ||
        played.getTime() - track.lastPlayed.getTime() >
          (track.duration || 60 * 3) * 1000
      ) {
        track.album.plays = track.album.plays + 1;
        track.album.lastPlayed = played;
        await track.album.save();

        track.plays = track.plays + 1;
        track.lastPlayed = played;
        await track.save();
      }
    }
  });
}
