import { Request, Response, NextFunction } from 'express';
import scanQueue from '@/scanner';

export type ScanStatusResponse = {
  scanStatus: {
    scanning: boolean;
    count: number;
  };
};

export default function scanStatus(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const queueItems = scanQueue.length;

  const response: ScanStatusResponse = {
    scanStatus: {
      scanning: queueItems !== 0,
      count: queueItems,
    },
  };

  res.locals = response;
  next();
}
