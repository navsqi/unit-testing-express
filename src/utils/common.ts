/* eslint-disable no-array-reduce/no-reduce */
import { Readable } from 'stream';
import crypto, { createHash } from 'crypto';
import dayjs from 'dayjs';
import { IGenerateNestedArrOfObj } from '~/types/commonTypes';
import { IPaging } from './queryHelper';

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

export const getDiffDateCount = (start_date: string, end_date: string) => {
  const dateDiff = Math.abs(dayjs(start_date).diff(dayjs(end_date), 'days'));

  return dateDiff;
};

export const parseIp = (req) => req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;

export const generateNestedMenu = (arr: IGenerateNestedArrOfObj[]) => {
  const result = arr
    .reduce((acc: Map<any, any>, item) => {
      acc.set(item.id, item);

      const parent = item.parent_id === null ? acc.get('root') : (acc.get(item.parent_id).children ??= []);

      parent.push(item);

      return acc;
    }, new Map([['root', []]]))
    .get('root');

  return result;
};

export const getCakupanUnit = (unit: number) => {
  const listCakupan = ['KANTOR PUSAT', 'WILAYAH', 'AREA', 'CABANG'];

  return listCakupan[unit - 1];
};

export const getRandomInt = (min = 100000000, max = 99999999) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getKodePrefix = () => {
  const time = dayjs().format('HHmmss');
  const digitAkhir = getRandomInt(1, 9).toString().padStart(2, '0');

  return `${time}${digitAkhir}`;
};

export const isSalesRole = (kodeRole: string) => {
  if (kodeRole == 'MKTO' || kodeRole.includes('BPO')) return true;

  return false;
};

export const getDescendantProp = (obj, desc) => {
  const arr = desc.split('.');
  while (arr.length && (obj = obj[arr.shift()]));
  return obj;
};

export const pagingExcel = (): IPaging => {
  return {
    limit: undefined,
    offset: undefined,
  };
};

export function md5(content) {
  return createHash('md5').update(content).digest('hex');
}

export const convertToCSV = (arr) => {
  if (!arr || arr.length <= 0) return '';

  const array = [Object.keys(arr[0])].concat(arr);

  return array
    .map((it) => {
      const objVal = Object.values(it).map((el: any) => {
        return el instanceof Date ? dayjs(el).format('YYYY-MM-DD HH:mm:ss') : el;
      });

      return objVal.toString();
    })
    .join('\n');
};
