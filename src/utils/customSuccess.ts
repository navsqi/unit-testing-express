import { response, Response } from 'express';
import { MetaPages } from '~/types/metaPage.types';

response.customSuccess = function (
  httpStatusCode: number,
  message: string,
  data: any = null,
  meta: MetaPages | null = null,
): Response {
  let metaData = null;

  if (meta) {
    metaData = {
      ...meta,
      totalPage: Math.ceil(meta.count / meta.limit) || 1,
    };
  }

  return this.status(httpStatusCode).json({ status: 'success', message, meta: metaData, data });
};
