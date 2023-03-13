import 'dotenv/config';
import EventEmitter from 'events';
import cronJob, { cronBigDataClosing } from '~/config/cron';
import { isBucketExist } from '~/config/minio';
import { dbCreateConnection } from '~/orm/dbCreateConnection';
import micrositeDb from '~/orm/micrositeDb';
import logger from './logger';

export const eventHandler: any = new EventEmitter();

const connect = async () => {
  // db kamila
  await dbCreateConnection();
  // db microsite
  await micrositeDb.dbCreateConnection();
  // bucket
  await isBucketExist(process.env.MINIO_BUCKET);
  // redis
  // await redisCreateConnection();

  // cron
  if (!cronJob.running) {
    cronJob.start();
    logger.info('CRON', 'CRON is running...');
  }

  // event handler
  eventHandler.on('performBackgroundTask', async (data: string) => {
    logger.info('CRON_TRIGGERED_BY_REST_API', 'Query Execute');
    await cronBigDataClosing();
  });
};

export default connect;
