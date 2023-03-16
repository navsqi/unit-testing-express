export {};

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
      JWT_EXPIRATION_HOURS: string;
      BASIC_USERNAME: string;
      BASIC_PASSWORD: string;
    }
  }
}
