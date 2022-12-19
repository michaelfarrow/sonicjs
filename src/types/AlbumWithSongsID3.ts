import AlbumID3 from './AlbumID3';
import Child from './Child';

type ArtistWithAlbumsID3 = AlbumID3 & {
  song: Child[];
};

export default ArtistWithAlbumsID3;
