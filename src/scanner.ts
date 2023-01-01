import log from '@/logger';
import queue from 'queue';

const CONCURRENCY = 1;

const scanQueue = queue({ concurrency: CONCURRENCY, autostart: false });

scanQueue.on('error', (error) => {
  log('scan job error');
  log(error);
});

scanQueue.on('end', (error) => {
  error && log(error);
});

export default scanQueue;
