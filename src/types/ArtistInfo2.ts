import ArtistID3 from './ArtistID3';
import ArtistInfoBase from './ArtistInfoBase';

type ArtistInfo2 = ArtistInfoBase & {
  similarArtist?: ArtistID3[];
};

export default ArtistInfo2;
