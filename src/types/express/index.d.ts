import { Language } from 'orm/entities/User';
import { jwtPayload } from 'types/jwtPayload';

declare global {
  namespace Express {
    export interface Request {
      language: Language;
      jwtPayload: jwtPayload;
    }
    export interface Response {
      customSuccess(httpStatusCode: number, message: string, data?: any): Response;
      customErrorValidation(httpStatusCode: number, data?: any): Response;
    }
  }
}
