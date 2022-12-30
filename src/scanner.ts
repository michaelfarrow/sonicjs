import queue from 'queue';

const CONCURRENCY = 1;

const scanQueue = queue({ concurrency: CONCURRENCY, autostart: false });

scanQueue.on('error', (error) => {
  console.log('scan job error');
  console.error(error);
});

scanQueue.on('end', (error) => {
  error && console.error(error);
});

export default scanQueue;
