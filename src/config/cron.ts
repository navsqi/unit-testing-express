import { CronJob } from 'cron';
import schedulerClosingSvc from '~/services/schedulerClosingSvc';
import * as common from '~/utils/common';
import logger from '~/utils/logger';

const CRON_PATTERN = {
  every10s: '*/10 * * * * *',
  every7am: '15 7 * * *',
};

export const cronBigDataClosing = async () => {
  await schedulerClosingSvc.schedulerClosing();
  await schedulerClosingSvc.schedulerClosingTabemas();
};

const cronJob: CronJob = new CronJob(process.env.CRON_CLOSING_PATTERN, async () => {
  try {
    logger.info('CRON', common.tanggal(new Date(), true));
    await cronBigDataClosing();
  } catch (e) {
    logger.error(common.tanggal(new Date(), true), 'CRON');
  }
});

export default cronJob;
