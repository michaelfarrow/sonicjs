import ArtistID3 from './ArtistID3';
import AlbumID3 from './AlbumID3';
import Child from './Child';

type SearchResult3 = {
  artist?: ArtistID3[];
  album?: AlbumID3[];
  song?: Child[];
};

export default SearchResult3;
