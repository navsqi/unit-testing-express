import { DataSource } from 'typeorm';

import config from './ormConfig';

export const dataSource = new DataSource(config);

export const dbCreateConnection = async (): Promise<DataSource | null> => {
  let conn: DataSource;
  try {
    conn = await dataSource.initialize();
    console.log(`[ORM] Database: '${conn.options.database}'`);
  } catch (e) {
    console.log(`[ORM] Connection to database failed: `, e.message.toString());
  }

  return conn;
};
