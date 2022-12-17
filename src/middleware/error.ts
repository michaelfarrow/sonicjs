import { Request, Response, NextFunction } from 'express';
import { Error as ErrorCodes } from '../error';

export default function xmlMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(
    error?.code === ErrorCodes.NotFound
      ? 404
      : [ErrorCodes.Authentication, ErrorCodes.UserNotRecognised].includes(
          error?.code
        )
      ? 401
      : error?.code === ErrorCodes.RequiredParamMissing
      ? 400
      : 500
  );
  res.locals = {
    error:
      error instanceof Error
        ? { code: ErrorCodes.Generic, message: error.message }
        : error,
  };
  next();
}
