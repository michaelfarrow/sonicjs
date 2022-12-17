import { Request, Response } from 'express';

export default function ping(req: Request, res: Response): void {
  res.json({});
}
