import { Request, Response, NextFunction } from 'express';
import { Error } from '../error';

export default function notFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!Object.keys(res.locals).length) {
    next({ code: Error.NotFound, message: 'Not Found' });
  } else {
    next();
  }
}
