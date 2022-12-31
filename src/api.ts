import { Router, Handler } from 'express';
import auth from '@/middleware/auth';
import error from '@/middleware/error';
import response from '@/middleware/response';
import notFound from '@/middleware/404';

import ping from '@/routes/ping';
import getMusicFolders from '@/routes/getMusicFolders';
import getAlbumList2 from '@/routes/getAlbumList2';
import getArtists from '@/routes/getArtists';
import getArtist from '@/routes/getArtist';
import getAlbum from '@/routes/getAlbum';
import getCoverArt from '@/routes/getCoverArt';
import search3 from '@/routes/search3';
import getStarred2 from '@/routes/getStarred2';
import getGenres from '@/routes/getGenres';
import getArtistInfo2 from '@/routes/getArtistInfo2';
import stream from '@/routes/stream';
import download from '@/routes/download';
import setRating from '@/routes/setRating';
import star from '@/routes/star';
import unstar from '@/routes/unstar';
import scrobble from '@/routes/scrobble';
import scanStatus from '@/routes/scanStatus';

const api = Router();

api.use(auth);

const route = (path: string, f: Handler) => api.get(`${path}\.:ext?`, f);

route('/ping', ping);
route('/getMusicFolders', getMusicFolders);
route('/getAlbumList', getAlbumList2);
route('/getAlbumList2', getAlbumList2);
route('/getArtists', getArtists);
route('/getArtist', getArtist);
route('/getAlbum', getAlbum);
route('/getCoverArt', getCoverArt);
route('/search3', search3);
route('/getStarred', getStarred2);
route('/getStarred2', getStarred2);
route('/getGenres', getGenres);
route('/getArtistInfo', getArtistInfo2);
route('/getArtistInfo2', getArtistInfo2);
route('/stream', stream);
route('/download', download);
route('/setRating', setRating);
route('/star', star);
route('/unstar', unstar);
route('/scrobble', scrobble);
route('/getScanStatus', scanStatus);
route('/startScan', scanStatus);

api.use(notFound);
api.use(error);
api.use(response);

export default api;
