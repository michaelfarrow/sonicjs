type AlbumID3 = {
  id: string;
  name: string;
  artist?: string;
  artistId?: string;
  coverArt?: string;
  songCount: number;
  duration: number;
  created: Date;
  starred?: Date;
  year?: number;
  genre?: string;
};

export default AlbumID3;
