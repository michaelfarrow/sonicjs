import { Request, Response, NextFunction } from 'express';
import log from '@/logger';

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const query = Object.entries(req.query).filter(
    ([key]) => !['u', 'p', 't', 's', 'f', 'v', 'c'].includes(key)
  );

  log(
    `REQUEST: ${req.path}${
      query.length
        ? ` (${query.map(([key, val]) => `${key}: ${val}`).join(', ')})`
        : ''
    }`
  );
  next();
}
