import { join } from 'path';
import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import Entities from './entities';

const ormConfig: ConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: true,
  entities: [...Object.values(Entities)],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  subscribers: [join(__dirname, 'subscribers', '*.{ts,js}')],
  cli: {
    entitiesDir: join(__dirname, 'entities'),
    migrationsDir: join(__dirname, 'migrations'),
    subscribersDir: join(__dirname, 'subscribers'),
  },
  namingStrategy: new SnakeNamingStrategy(),
};

export = ormConfig;
