import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import entities from '~/entities';

const globalVars = {
  db: {
    development: {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      synchronize: false,
      logging: false,
      entities: [...Object.values(entities)],
      migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
      subscribers: [join(__dirname, 'subscribers', '*.{ts,js}')],
      namingStrategy: new SnakeNamingStrategy(),
    } as DataSourceOptions,
    test: {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME + '_test',
      synchronize: false,
      logging: false,
      entities: [...Object.values(entities)],
      migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
      subscribers: [join(__dirname, 'subscribers', '*.{ts,js}')],
      namingStrategy: new SnakeNamingStrategy(),
    },
  },
};

export default globalVars;
