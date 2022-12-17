import AlbumID3 from './AlbumID3';
import ArtistID3 from './ArtistID3';

type ArtistWithAlbumsID3 = ArtistID3 & {
  album: AlbumID3[];
};

export default ArtistWithAlbumsID3;
