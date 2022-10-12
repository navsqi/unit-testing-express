import { response, Response } from 'express';

interface MetaPages {
  count: number;
  rowCount: number;
  page: number;
  limit: number;
  offset: number;
  totalPage: number;
}

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

  return this.status(httpStatusCode).json({ status: 'success', meta: metaData, message, data });
};
