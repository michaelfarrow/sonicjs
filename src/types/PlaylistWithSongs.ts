import Playlist from './Playlist';
import Child from './Child';

type PlaylistWithSongs = Playlist & {
  entry?: Child[];
};

export default PlaylistWithSongs;
