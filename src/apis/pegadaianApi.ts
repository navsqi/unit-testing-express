import 'dotenv/config';

import axios, { AxiosPromise } from 'axios';
import logger from '~/utils/logger';

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

const API_URL_OAUTH =
  process.env.NODE_ENV === 'production'
    ? process.env.PEGADAIANAPI_URL
    : process.env.PEGADAIANAPI_URL + ':' + process.env.PEGADAIANAPI_PORT_OAUTH;
const API_URL =
  process.env.NODE_ENV === 'production'
    ? process.env.PEGADAIANAPI_URL
    : process.env.PEGADAIANAPI_URL + ':' + process.env.PEGADAIANAPI_PORT;

const pegadaianApiEnv = {
  authApi: {
    grantType: 'password',
    authUser: process.env.PEGADAIANAPI_AUTH_USER,
    authPass: process.env.PEGADAIANAPI_AUTH_PASS,
    basicUser: process.env.PEGADAIANAPI_BASIC_USER_OAUTH,
    basicPass: process.env.PEGADAIANAPI_BASIC_PASS_OAUTH,
    url: API_URL_OAUTH,
  },
  api: {
    url: API_URL,
    port: process.env.PEGADAIANAPI_PORT,
    channelId: process.env.PEGADAIANAPI_CHANNELID,
    clientId: process.env.PEGADAIANAPI_CLIENTID,
    treshold: '75',
  },
  tscale: {
    url: process.env.TSCALE_EXTERNAL_URL,
    urlAuth: process.env.TSCALE_EXTERNAL_URL_AUTH,
    channelId: process.env.TSCALE_EXTERNAL_CHANNELID,
    clientId: process.env.TSCALE_EXTERNAL_CLIENTID,
    authUser: process.env.TSCALE_EXTERNAL_AUTH_USER,
    authPass: process.env.TSCALE_EXTERNAL_AUTH_PASS,
    basicUser: process.env.TSCALE_EXTERNAL_BASIC_USER,
    basicPass: process.env.TSCALE_EXTERNAL_BASIC_PASS,
    grantType: 'password',
  },
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
  logger.info('GET_TOKEN_API', 'HITTING OAUTH API...');
  const getToken = await axios.post(
    pegadaianApiEnv.authApi.url + '/oauth/token',
    new URLSearchParams({
      grant_type: pegadaianApiEnv.authApi.grantType,
      username: pegadaianApiEnv.authApi.authUser,
      password: pegadaianApiEnv.authApi.authPass,
    }),
    {
      auth: {
        username: pegadaianApiEnv.authApi.basicUser,
        password: pegadaianApiEnv.authApi.basicPass,
      },
    },
  );

  return getToken;
};

export const getTokenTScale = async (): Promise<AxiosPromise> => {
  const getToken = await axios.post(
    pegadaianApiEnv.tscale.urlAuth,
    new URLSearchParams({
      grant_type: pegadaianApiEnv.tscale.grantType,
      username: pegadaianApiEnv.tscale.authUser,
      password: pegadaianApiEnv.tscale.authPass,
    }),
    {
      auth: {
        username: pegadaianApiEnv.tscale.basicUser,
        password: pegadaianApiEnv.tscale.basicPass,
      },
    },
  );

  return getToken;
};

export const checkEktpDukcapil = async (body: IKTPDukcapil): Promise<AxiosPromise> => {
  const reqBearerToken = await getTokenTScale();

  const bearerToken = reqBearerToken.data.access_token;

  const getToken = await axios.post(
    pegadaianApiEnv.tscale.url + '/switching/dukcapil/dukcapil/inquiry',
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
      channelId: pegadaianApiEnv.tscale.channelId,
      clientId: pegadaianApiEnv.tscale.clientId,
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

  logger.info('HIT_API_MW_IDKTP', 'HITTING....');
  const nasabah = await axios.post(
    pegadaianApiEnv.api.url + '/customer/checkktp',
    {
      channelId: pegadaianApiEnv.api.channelId,
      clientId: pegadaianApiEnv.api.clientId,
      flag: body.flag,
      noIdentitas: body.nik,
    },
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );

  return nasabah;
};

export const getNasabahByCif = async (body): Promise<AxiosPromise> => {
  const reqBearerToken = await getToken();

  const bearerToken = reqBearerToken.data.access_token;

  logger.info('HIT_API_MW_CIF', 'HITTING....');
  const nasabah = await axios.post(
    pegadaianApiEnv.api.url + '/customer/inquiry',
    {
      channelId: pegadaianApiEnv.api.channelId,
      clientId: pegadaianApiEnv.api.clientId,
      cif: body.cif,
    },
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );

  return nasabah;
};

export const getBadanUsahaByCif = async (body: IBadanUsahaByCif): Promise<AxiosPromise> => {
  const reqBearerToken = await getToken();

  const bearerToken = reqBearerToken.data.access_token;

  const badanUsaha = await axios.post(
    pegadaianApiEnv.api.url + '/customer/corporate/detailbadanusaha',
    {
      channelId: pegadaianApiEnv.api.channelId,
      clientId: pegadaianApiEnv.api.clientId,
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
