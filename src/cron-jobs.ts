import { CronJob } from 'cron';
import updateAlbumRand from '@/jobs/updateAlbumRand';

export function initCron() {
  new CronJob('0 0 * * * *', updateAlbumRand(), null, true);
}
