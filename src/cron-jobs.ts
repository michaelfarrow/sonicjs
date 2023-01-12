import { CronJob } from 'cron';
import updateAlbumRand from '@/jobs/updateAlbumRand';
import { rescan } from '@/library';

export function initCron() {
  new CronJob('0 0 * * * *', updateAlbumRand(), null, true);
  new CronJob('0 0 16 * * *', rescan, null, true);
}
