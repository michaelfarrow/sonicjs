import { NextFunction, Request, Response } from 'express';
import { Starred2 } from '../types';

export type GetStarred2Response = {
  starred2: Starred2;
};

export default async function getStarred2(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const response: GetStarred2Response = { starred2: {} };

  res.locals = response;
  next();
}
