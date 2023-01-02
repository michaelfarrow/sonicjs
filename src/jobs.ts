import log from '@/logger';
import queue from 'queue';

const CONCURRENCY = 1;

const jobsQueue = queue({
  concurrency: CONCURRENCY,
  autostart: false,
});

// q.on('success', (res, job) => {
//   console.log('queue job success');
//   console.log(res);
// });

jobsQueue.on('error', (error, job) => {
  log(error);
});

export default jobsQueue;
