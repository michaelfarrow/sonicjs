import { Request, Response, NextFunction } from 'express';
import log from '@/logger';
import { Error } from '@/error';

export default function notFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!Object.keys(res.locals).length) {
    log('Not found', req.path);
    next({ code: Error.NotFound, message: 'Not Found' });
  } else {
    next();
  }
}
