import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import { Error } from '@/error';
import { z as zod, ZodRawShape } from 'zod';
import { fromZodError } from 'zod-validation-error';

export default function genericHandler<T extends ZodRawShape>(
  schema: (z: typeof zod) => T,
  handler: (
    query: zod.infer<ReturnType<typeof zod.object<T>>>,
    next: NextFunction,
    res: Response,
    req: Request
  ) => Promise<any> | void
) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const _schema = zod.object(schema(zod));
    const schemaRes = _schema.safeParse(req.query);

    if (!schemaRes.success) {
      return next({
        code: Error.Generic,
        message: fromZodError(schemaRes.error).message,
      });
    }

    return handler(schemaRes.data, next, res, req);
  };
}
