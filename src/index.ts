import app from '@/App';
import log from '@/logger';
import { initLibrary } from '@/library';
import { initDb } from '@/db';
import { initCron } from '@/cron-jobs';

const port = process.env.PORT || 3000;

initDb().then(() => {
  initLibrary().then(() => {
    initCron();
    app()
      .listen(port, () => {
        return console.log(`server is listening on ${port}`);
      })
      .on('error', (err) => {
        return log(err);
      });
  });
});
