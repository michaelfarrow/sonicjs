import app from './App';
import { init } from './library';

const port = process.env.PORT || 3000;
const root = '/Users/mike.farrow/music-lib';

init(root).then((res) => {
  app(root)
    .listen(port, () => {
      return console.log(`server is listening on ${port}`);
    })
    .on('error', (err) => {
      return console.log(err);
    });
});
