import ArtistID3 from './ArtistID3';

type ArtistsID3 = {
  ignoredArticles: string;
  index: {
    name: string;
    artist: ArtistID3[];
  }[];
};

export default ArtistsID3;
