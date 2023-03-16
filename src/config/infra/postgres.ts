import { DataSource } from 'typeorm';
import logger from '~/utils/logger';
import globalVars from '../globalVars';

export const dataSource = new DataSource(globalVars.db[process.env.NODE_ENV]);

export const dbCreateConnection = async (): Promise<DataSource | null> => {
  let conn: DataSource;
  try {
    conn = await dataSource.initialize();
    logger.info(`Database: ${conn.options.database}`);
  } catch (e) {
    logger.error(e.message);
  }

  return conn;
};

export default {
  dataSource,
  dbCreateConnection,
};
