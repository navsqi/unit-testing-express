import { response, Response } from 'express';

response.customErrorValidation = function (httpStatusCode: number, error: any = null): Response {
  return this.status(httpStatusCode).json({ status: 'fail', message: 'Payload validation error', error });
};
