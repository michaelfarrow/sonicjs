import { Request, Response, NextFunction } from 'express';
import { clearMetadataCache } from '../library';

export default function clearCacheMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  clearMetadataCache();
  next();
}
