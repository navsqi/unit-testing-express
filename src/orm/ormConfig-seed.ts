import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const configSeed: ConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: ['src/orm/entities/**/*.ts'],
  migrations: ['src/orm/seeds/**/*.ts'],
  cli: {
    migrationsDir: 'src/orm/seeds',
  },
  namingStrategy: new SnakeNamingStrategy(),
};

export = configSeed;
