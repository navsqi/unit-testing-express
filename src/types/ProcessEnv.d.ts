// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { string } from 'joi';

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      NODE_ENV: string;
      PORT: string;
      DB_HOST: string;
      DB_PORT: string;
      DB_USER: string;
      DB_PASS: string;
      DB_NAME: string;
      REDIS_HOST: string;
      REDIS_PORT: string;
      REDIS_AUTH: string;
      JWT_SECRET_KEY: string;
      JWT_EXPIRATION_DAY: string;
      BASIC_USERNAME: string;
      BASIC_PASSWORD: string;
      MINIO_SERVER: string;
      MINIO_PORT: string;
      MINIO_ID: string;
      MINIO_KEY: string;
      MINIO_SSL: string;
      MINIO_BUCKET: string;
      MINIO_LINK_PREFIX: string;
      SSO_URL: string;
      SSO_CLIENT: string;
      SSO_SECRET: string;
      SSO_STATE: string;
      SSO_REDIRECT_URI: string;
      TSCALE_EXTERNAL_URL: string;
      TSCALE_EXTERNAL_URL_AUTH: string;
      TSCALE_EXTERNAL_CHANNELID: string;
      TSCALE_EXTERNAL_CLIENTID: string;
      TSCALE_EXTERNAL_AUTH_USER: string;
      TSCALE_EXTERNAL_AUTH_PASS: string;
      TSCALE_EXTERNAL_BASIC_USER: string;
      TSCALE_EXTERNAL_BASIC_PASS: string;
      PEGADAIANAPI_URL: string;
      PEGADAIANAPI_PORT: string;
      PEGADAIANAPI_PORT_OAUTH: string;
      PEGADAIANAPI_BASIC_USER: string;
      PEGADAIANAPI_BASIC_PASS: string;
      PEGADAIANAPI_BASIC_USER_OAUTH: string;
      PEGADAIANAPI_BASIC_PASS_OAUTH: string;
      PEGADAIANAPI_AUTH_PASS: string;
      PEGADAIANAPI_AUTH_USER: string;
      PEGADAIANAPI_CHANNELID: string;
      PEGADAIANAPI_CLIENTID: string;
      SENTRY_DSN: string;
    }
  }
}
