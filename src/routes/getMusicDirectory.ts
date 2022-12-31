import { Request, Response, NextFunction } from 'express';

export type GetMusicDirectoryResponse = {
  directory: [];
};

export default function getMusicDirectory(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const response: GetMusicDirectoryResponse = {
    directory: [],
  };

  res.locals = response;
  next();
}
