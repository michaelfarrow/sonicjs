type Playlist = {
  id: string;
  name: string;
  comment?: string;
  owner?: string;
  public?: boolean;
  songCount: number;
  duration: number;
  created: Date;
  changed: Date;
  coverArt?: string;
};

export default Playlist;
