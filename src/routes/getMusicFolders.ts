import { Request, Response } from 'express';
import { MusicFolder } from '../types';

export type GetMusicFoldersResponse = {
  musicFolders: {
    musicFolder: MusicFolder[];
  };
};

export default function getMusicFolders(req: Request, res: Response): void {
  const response: GetMusicFoldersResponse = {
    musicFolders: {
      musicFolder: [{ id: 1, name: 'Music' }],
    },
  };

  res.json(response);
}
