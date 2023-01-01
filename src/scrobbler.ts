import log from '@/logger';
import { default as queueLib } from 'queue';
import { TrackRepository } from '@/db';

const CONCURRENCY = 1;

export const q = queueLib({ concurrency: CONCURRENCY, autostart: true });

q.on('error', (error) => {
  log('scrobble job error');
  log(error);
});

q.on('end', (error) => {
  error && log(error);
});

export default function srobble(id: string | string[]) {
  q.push(async () => {
    const tracks = await TrackRepository.getAll()
      .where((t) => t.id)
      .in(Array.isArray(id) ? id : [id])
      .include((a) => a.album)
      .toPromise();
    const played = new Date();

    for (const track of tracks) {
      // TODO: Songs from same album only inc album count by one
      if (
        track.lastPlayed === null ||
        played.getTime() - track.lastPlayed.getTime() >
          (track.duration || 60 * 3) * 1000
      ) {
        track.album.plays = null as any;
        track.album.lastPlayed = played;
        await track.album.save();

        track.plays = track.plays + 1;
        track.lastPlayed = played;
        await track.save();
      }
    }
  });
}
