import { DataSourceOptions } from 'typeorm';

const ormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST_MICROSITE,
  port: Number(process.env.DB_PORT_MICROSITE),
  username: process.env.DB_USER_MICROSITE,
  password: process.env.DB_PASS_MICROSITE,
  database: process.env.DB_NAME_MICROSITE,
  logging: false,
};

export = ormConfig;
