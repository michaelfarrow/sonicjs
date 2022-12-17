import { Request, Response } from 'express';
import { AlbumID3 } from '../types';

export type GetAlbumList2Response = {
  albumList2: {
    album: AlbumID3[];
  };
};

export default function getAlbumList2(req: Request, res: Response): void {
  const response: GetAlbumList2Response = {
    albumList2: {
      album: [
        {
          id: '1',
          name: 'Duets',
          artist: 'Test',
          artistId: '1',
          coverArt: 'al-1768',
          songCount: 2,
          created: new Date(),
          duration: 514,
          starred: false,
        },
      ],
    },
  };

  res.json(response);
}
