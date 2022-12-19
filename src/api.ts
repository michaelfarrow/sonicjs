import { Router } from 'express';
import auth from './middleware/auth';
import error from './middleware/error';
import response from './middleware/response';
import notFound from './middleware/404';

import ping from './routes/ping';
import getMusicFolders from './routes/getMusicFolders';
import getAlbumList2 from './routes/getAlbumList2';
import getArtists from './routes/getArtists';
import getArtist from './routes/getArtist';
import getAlbum from './routes/getAlbum';
import getCoverArt from './routes/getCoverArt';
import stream from './routes/stream';

const api = Router();

api.use(auth);

api.get('/ping.view', ping);
api.get('/getMusicFolders.view', getMusicFolders);
api.get('/getAlbumList2.view', getAlbumList2);
api.get('/getArtists.view', getArtists);
api.get('/getArtist.view', getArtist);
api.get('/getAlbum.view', getAlbum);
api.get('/getCoverArt.view', getCoverArt);
api.get('/stream.view', stream);

api.use(notFound);
api.use(error);
api.use(response);

export default api;
