import { NextFunction, Request, Response } from 'express';
import logger from '~/utils/logger';
import CustomError from '../utils/customError';

const handleJWTError = () => new CustomError('Invalid token or JWT malformed', 401);
const handleJWTExpiredError = () => new CustomError('Your token has expired! Please log in again.', 401);
const payloadValidationError = () => new CustomError('Payload validation error', 400);
const queryFailedError = (msg: string) => new CustomError(msg, 400);
const axiosError = (msg: string) => new CustomError(msg, 400);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (err: CustomError | any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);

  const stack = err.stack;

  if (err.name === 'JsonWebTokenError') err = handleJWTError();
  else if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();
  else if (err.name === 'PayloadValidationError') {
    err = payloadValidationError();
    err.stack = stack;
  } else if (err.name === 'QueryFailedError') {
    err = queryFailedError(err.sqlMessage);
    err.stack = stack;
  }

  if (err.name === 'AxiosError') err = axiosError(JSON.stringify(err.response.data));

  const statusCode = err.statusCode ? err.statusCode : 500;
  const error = err.JSON
    ? err.JSON
    : {
        statusCode: err.statusCode,
        status: 'fail',
        message: err.message,
      };

  return res.status(statusCode).json(error);
};
