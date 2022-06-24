// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { string } from 'joi';

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      PORT: string;
      NODE_ENV: string;
      DB_HOST: string;
      DB_PORT: string;
      DB_USER: string;
      DB_PASS: string;
      DB_NAME: string;
      JWT_SECRET_KEY: string;
      JWT_EXPIRATION_DAY: string;
      REDIS_HOST: string;
      REDIS_PORT: string;
      REDIS_AUTH: string;
      SSO_URL: string;
      SSO_CLIENT: string;
      SSO_SECRET: string;
      SSO_STATE: string;
      REDIRECT_URI: string;
      MINIO_SERVER: string;
      MINIO_PORT: string;
      MINIO_ID: string;
      MINIO_KEY: string;
      MINIO_SSL: string;
      MINIO_BUCKET: string;
    }
  }
}
