import { NextFunction, Request, Response } from 'express';
import { Genre } from '../types';

export type GetStarred2Response = {
  genres: {
    genre: Genre[];
  };
};

export default async function getStarred2(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const response: GetStarred2Response = {
    genres: { genre: [{ value: 'Rock', songCount: 5976, albumCount: 479 }] },
  };

  res.locals = response;
  next();
}
