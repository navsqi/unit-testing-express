import User from '~/entities/User';
import { jwtPayload } from 'types/jwtPayload.types';
import { MetaPages } from '../metaPage.types';

declare global {
  namespace Express {
    export interface Request {
      jwtPayload: jwtPayload;
      user: User;
    }
    export interface Response {
      customSuccess(httpStatusCode: number, message: string, data?: any, meta?: MetaPages): Response;
      customErrorValidation(httpStatusCode: number, data?: any): Response;
    }
  }
}
