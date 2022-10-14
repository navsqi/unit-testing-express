import User from 'orm/entities/User';
import { jwtPayload } from 'types/jwtPayload';
import { MetaPages } from '../metaPageTypes';

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
