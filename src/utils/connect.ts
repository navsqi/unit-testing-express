import 'dotenv/config';
import EventEmitter from 'events';
import { dbCreateConnection } from '~/config/infra/postgres';
import logger from './logger';

export const eventHandler: any = new EventEmitter();

const connect = async () => {
  return await dbCreateConnection();
};

export default connect;
