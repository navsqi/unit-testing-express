import { NextFunction, Request, Response } from 'express';
import CustomError from '~/utils/customError';
import logger from '~/utils/logger';

export const basicAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = { login: process.env.BASIC_USERNAME, password: process.env.BASIC_PASSWORD };

    // parse login and password from headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    // Verify login and password are set and correct
    if (login && password && login === auth.login && password === auth.password) {
      // Access granted...
      return next();
    }

    // Access denied...
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).json({ status: 'fail', message: 'Authentication required' });
  } catch (e) {
    logger.error(e);
    return next(new CustomError('Something went wrong', 500));
  }
};
