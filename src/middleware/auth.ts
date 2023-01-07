import { Request, Response, NextFunction } from 'express';
import { Error } from '@/error';
import crypto from 'crypto';
import { AUTH_USER, AUTH_PASS } from '@/config';

function hexToString(hex: string) {
  var str = '';
  for (var i = 0; i < hex.length; i += 2)
    str += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
  return str;
}

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

  if (req.path == '/ping.view') {
    return next();
  }

  if (password.length) {
    const encoded = password.match(/^enc:(.*?)$/);
    authenticated =
      username === AUTH_USER &&
      (encoded ? hexToString(encoded[1]) : password) === AUTH_PASS;
  } else {
    let hashedPassword = crypto
      .createHash('md5')
      .update(`${AUTH_PASS}${salt}`)
      .digest('hex');

    authenticated = username === AUTH_USER && token === hashedPassword;
  }

  if (authenticated) {
    next();
  } else {
    next({
      code: Error.Authentication,
      message: 'Authentication failed',
    });
  }
}
