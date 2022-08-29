import { CronJob } from 'cron';
import schedulerClosing from '~/services/schedulerClosingSvc';
import * as common from '~/utils/common';
import logger from '~/utils/logger';

const CRON_PATTERN = {
  every10s: '*/10 * * * * *',
  every5am: '0 5 * * *',
};

const cronJob: CronJob = new CronJob(CRON_PATTERN.every10s, async () => {
  try {
    logger.info('CRON', common.tanggal(new Date(), true));
    await schedulerClosing();
  } catch (e) {
    logger.error(common.tanggal(new Date(), true), 'CRON');
  }
});

export default cronJob;
