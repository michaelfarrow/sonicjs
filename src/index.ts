import app from './App';
import scanner from './scanner';

const port = process.env.PORT || 3000;

scanner('/Users/mike.farrow/music-lib').then((res) => {
  app
    .listen(port, () => {
      return console.log(`server is listening on ${port}`);
    })
    .on('error', (err) => {
      return console.log(err);
    });
});
