import { Request, Response, NextFunction } from 'express';
import scanQueue from '@/scanner';
import scanStatus from './scanStatus';
import { rescan } from '@/library';

export default function startScan(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!scanQueue.length) rescan(true);

  return scanStatus(req, res, next);
}
