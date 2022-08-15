import { DataSource } from 'typeorm';
import logger from '~/utils/logger';

import config from './ormConfig';

export const dataSource = new DataSource(config);

export const dbCreateConnection = async (): Promise<DataSource | null> => {
  let conn: DataSource;
  try {
    conn = await dataSource.initialize();
    logger.info('ORM', `Database: '${conn.options.database}'`);
  } catch (e) {
    logger.error(e.message, 'ORM');
  }

  return conn;
};
