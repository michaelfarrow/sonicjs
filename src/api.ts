import { Router } from 'express';
import auth from './middleware/auth';
import response from './middleware/response';

import ping from './routes/ping';
import getMusicFolders from './routes/getMusicFolders';
import getAlbumList2 from './routes/getAlbumList2';

const api = Router();

api.use(response);
api.use(auth);

api.get('/ping.view', ping);
api.get('/getMusicFolders.view', getMusicFolders);
api.get('/getAlbumList2.view', getAlbumList2);

api.get('/*', (req) => {
  console.log('[UNHANDLED]', req.path);
});

export default api;
