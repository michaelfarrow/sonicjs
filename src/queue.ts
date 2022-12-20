import { default as queueLib } from 'queue';

const CONCURRENCY = 1;

export const q = queueLib({ concurrency: CONCURRENCY, autostart: true });

export function queue(f: () => Promise<any>) {
  // console.log('Pushing job to queue');
  q.push(f);
}

// q.on('success', (res, job) => {
//   console.log('queue job success');
//   console.log(res);
// });

q.on('error', (error, job) => {
  console.log('queue job error');
  console.error(error);
});

q.on('end', (error) => {
  console.log('queue end');
  error && console.error(error);
});
