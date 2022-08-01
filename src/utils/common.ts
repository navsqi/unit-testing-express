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

export const rupiah = (num: number, isSign = true) => {
  const options: { [key: string]: any } = {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  };

  if (!isSign) {
    delete options['style'];
    delete options['currency'];
  }

  // Create our number formatter.
  const rp = new Intl.NumberFormat('id-ID', options);

  return rp.format(num);
};

export const tanggal = (tgl: string | Date | number, is_time = false) => {
  if (is_time) {
    return dayjs(tgl).format('DD MMMM YYYY HH:mm:ss');
  }
  return dayjs(tgl).format('DD MMMM YYYY');
};

export const getMonthName = (month: string) => {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return months[+month + 1];
};

export const parseIp = (req) => req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
