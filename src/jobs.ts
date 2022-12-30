import queue from 'queue';

const CONCURRENCY = 1;

const jobsQueue = queue({
  concurrency: CONCURRENCY,
  autostart: true,
});

// q.on('success', (res, job) => {
//   console.log('queue job success');
//   console.log(res);
// });

jobsQueue.on('error', (error, job) => {
  console.log('queue job error');
  console.error(error);
});

jobsQueue.on('end', (error) => {
  error && console.error(error);
});

export default jobsQueue;
