import 'dotenv/config';

import axios, { AxiosPromise } from 'axios';
import { parseIp } from '~/utils/common';

interface IBadanUsahaByCif {
  cif: string;
  flag: string;
}

interface IKTPPassion {
  nik: string;
  flag: string;
}

interface IKTPDukcapil {
  nik: string;
  nama?: string;
  ipUser?: string;
}

const pegadaianApiEnv = {
  grantType: 'password',
  oauthUsername: 'test',
  oauthPass: 'test',
  basic: {
    username: 'aplikasijs',
    password: 'aplikasi123',
  },
  url: 'https://devpds.pegadaian.co.id:9090',
  channelId: '6017',
  clientId: '9997',
  treshold: '75',
};

export const bodyEktp = {
  nik: '',
  noKK: '',
  namaLengkap: '',
  alamat: '',
  tempatLahir: '',
  tglLahir: '',
  namaAyah: '',
  namaIbu: '',
  kabupaten: '',
  kecamatan: '',
  kelurahan: '',
  provinsi: '',
  noKabupaten: '',
  noKecamatan: '',
  noKelurahan: '',
  noProvinsi: '',
  noRT: '',
  noRW: '',
  pendidikan: '',
  jenisKelamin: '',
  pekerjaan: '',
  statusKawin: '',
  channelId: '',
  clientId: '',
  treshold: '',
  ipUser: '',
  agama: '',
};

export const getToken = async (): Promise<AxiosPromise> => {
  const getToken = await axios.post(
    pegadaianApiEnv.url + '/oauth/token',
    new URLSearchParams({
      grant_type: pegadaianApiEnv.grantType,
      username: pegadaianApiEnv.oauthUsername,
      password: pegadaianApiEnv.oauthPass,
    }),
    {
      auth: pegadaianApiEnv.basic,
    },
  );

  return getToken;
};

export const getTokenTScale = async (): Promise<AxiosPromise> => {
  const getToken = await axios.post(
    process.env.TSCALE_EXTERNAL_URL_AUTH,
    new URLSearchParams({
      grant_type: 'password',
      username: process.env.TSCALE_EXTERNAL_AUTH_USER,
      password: process.env.TSCALE_EXTERNAL_AUTH_PASS,
    }),
    {
      auth: {
        username: process.env.TSCALE_EXTERNAL_BASIC_USER,
        password: process.env.TSCALE_EXTERNAL_BASIC_PASS,
      },
    },
  );

  return getToken;
};

export const checkEktpDukcapil = async (body: IKTPDukcapil): Promise<AxiosPromise> => {
  const reqBearerToken = await getTokenTScale();

  const bearerToken = reqBearerToken.data.access_token;

  const getToken = await axios.post(
    process.env.TSCALE_EXTERNAL_URL + '/switching/dukcapil/dukcapil/inquiry',
    {
      nik: body.nik,
      noKK: '',
      namaLengkap: body.nama ?? '',
      alamat: '',
      tempatLahir: '',
      tglLahir: '01-01-1901',
      namaAyah: '',
      namaIbu: '',
      kabupaten: ' ',
      kecamatan: ' ',
      kelurahan: ' ',
      provinsi: '',
      noKabupaten: '',
      noKecamatan: '',
      noKelurahan: '',
      noProvinsi: '',
      noRT: '000',
      noRW: '000',
      pendidikan: '',
      jenisKelamin: '',
      pekerjaan: '',
      statusKawin: '',
      agama: '',
      treshold: '90',
      channelId: process.env.TSCALE_EXTERNAL_CHANNELID,
      clientId: process.env.TSCALE_EXTERNAL_CLIENTID,
      ipUser: body.ipUser ? body.ipUser : '10.31.78.20',
    },
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );

  return getToken;
};

export const getNasabahByIdKtpPassion = async (body: IKTPPassion): Promise<AxiosPromise> => {
  const reqBearerToken = await getToken();

  const bearerToken = reqBearerToken.data.access_token;

  const badanUsaha = await axios.post(
    pegadaianApiEnv.url + '/customer/checkktp',
    {
      channelId: pegadaianApiEnv.channelId,
      clientId: pegadaianApiEnv.clientId,
      flag: body.flag,
      noIdentitas: body.nik,
    },
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );

  return badanUsaha;
};

export const getNasabahByCif = async (body): Promise<AxiosPromise> => {
  const reqBearerToken = await getToken();

  const bearerToken = reqBearerToken.data.access_token;

  const badanUsaha = await axios.post(
    pegadaianApiEnv.url + '/customer/inquiry',
    {
      channelId: pegadaianApiEnv.channelId,
      clientId: pegadaianApiEnv.clientId,
      cif: body.cif,
    },
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );

  return badanUsaha;
};

export const getBadanUsahaByCif = async (body: IBadanUsahaByCif): Promise<AxiosPromise> => {
  const reqBearerToken = await getToken();

  const bearerToken = reqBearerToken.data.access_token;

  const badanUsaha = await axios.post(
    pegadaianApiEnv.url + '/customer/corporate/detailbadanusaha',
    {
      channelId: pegadaianApiEnv.channelId,
      clientId: pegadaianApiEnv.clientId,
      cif: body.cif,
      flag: body.flag,
    },
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );

  return badanUsaha;
};

const APIPegadaian = {
  checkEktpDukcapil,
  getNasabahByIdKtpPassion,
  getNasabahByCif,
  getBadanUsahaByCif,
};

export default APIPegadaian;
