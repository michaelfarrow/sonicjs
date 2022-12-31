import { Request, Response, NextFunction } from 'express';

export type GetIndexesResponse = {
  indexes: {
    index: [];
  };
};

export default function getIndexes(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const response: GetIndexesResponse = {
    indexes: {
      index: [],
    },
  };

  res.locals = response;
  next();
}
