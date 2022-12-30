import MediaType from './MediaType';

type Child = {
  id: string;
  parent?: string;
  isDir?: Boolean;
  title: string;
  album?: string;
  artist?: string;
  track?: number;
  year?: number;
  coverArt?: string;
  size?: number;
  contentType?: string;
  suffix?: string;
  transcodedContentType?: string;
  transcodedSuffix?: string;
  duration?: number;
  bitRate?: number;
  path?: string;
  isVideo?: Boolean;
  userRating?: number;
  averageRating?: number;
  discNumber?: number;
  created?: Date;
  starred?: Date;
  albumId?: string;
  artistId?: string;
  type?: MediaType;
  bookmarkPosition?: number;
  originalWidth?: number;
  originalHeight?: number;
};

export default Child;
