import crypto from 'crypto';

export const generateRandomStr = (length: number) => {
  const id = crypto.randomBytes(length).toString('hex').toUpperCase();

  return id;
};

export const generateFileName = (originalname: string) => {
  const splitname = originalname.split('.');
  const type = splitname[1];

  return `HBL${generateRandomStr(8)}${Date.now()}.${type}`;
};
