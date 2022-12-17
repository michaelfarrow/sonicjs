import { Request, Response, NextFunction } from 'express';

export default function responseMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const _json = res.json;

  const json: typeof res.json = function (data) {
    const isError = data?.hasOwnProperty?.('error') === true;
    let _res: any = {};

    if (isError) {
      _res.status = 'failed';
      _res.error = data.error;
    } else {
      _res.status = 'ok';
      _res = { ..._res, ...data };
    }

    _json.call(res, {
      'subsonic-response': _res,
    });

    return data;
  };

  res.json = json;

  next();
}
