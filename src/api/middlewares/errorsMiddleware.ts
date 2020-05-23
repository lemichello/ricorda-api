import { Request, Response, NextFunction } from 'express';
import { IErrorsMiddleware } from './interfaces/IErrorsMiddleware';
import { isBoom, boomify } from '@hapi/boom';

export default class ErrorsMiddleware implements IErrorsMiddleware {
  handleError(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): any {
    if (isBoom(err)) {
      let boomError = boomify(err);

      return res
        .status(boomError.output.statusCode)
        .send(boomError.output.payload.message);
    }

    res.status(500).send('Internal server error');
  }
}
