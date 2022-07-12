import { Readable } from 'stream';
import crypto from 'crypto';
import dayjs from 'dayjs';

export const generateRandomStr = (length: number) => {
  const id = crypto.randomBytes(length).toString('hex').toUpperCase();

  return id;
};

export const generateFileName = (originalname: string) => {
  const splitname = originalname.split('.');
  const type = splitname[1];

  return `HBL${generateRandomStr(8)}${Date.now()}.${type}`;
};

export const bufferToStream = (buffer: Buffer) => {
  return Readable.from(buffer.toString());
};

export const addDays = (totalDays: number, isTime = false) => {
  if (isTime) {
    return dayjs().add(totalDays).format('YYYY-MM-DD HH:mm:ss');
  }

  return dayjs().add(totalDays).format('YYYY-MM-DD');
};

export const parseIp = (req) => req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
