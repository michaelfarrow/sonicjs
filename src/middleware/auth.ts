import { Request, Response, NextFunction } from 'express';
import { Error } from '../error';
import crypto from 'crypto';

const USERNAME = 'admin';
const PASSWORD = 'pass';

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let authenticated = false;

  const username = String(req.query.u || '');
  const password = String(req.query.p || '');
  const token = String(req.query.t || '');
  const salt = String(req.query.s || '');

  if (password.length) {
    authenticated = username === USERNAME && password === PASSWORD;
  } else {
    let hashedPassword = crypto
      .createHash('md5')
      .update(`${PASSWORD}${salt}`)
      .digest('hex');

    authenticated = username === USERNAME && token === hashedPassword;
  }

  if (authenticated) {
    next();
  } else {
    res.json({
      error: {
        code: Error.Authentication,
        message: 'Authentication failed',
      },
    });
  }
}
