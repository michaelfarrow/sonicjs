import { Request, Response, NextFunction } from 'express';

export default function ping(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.locals = { empty: true };
  next();
}
