import { response, Response } from 'express';

response.customSuccess = function (httpStatusCode: number, message: string, data: any = null): Response {
  return this.status(httpStatusCode).json({ status: 'success', message, data });
};
