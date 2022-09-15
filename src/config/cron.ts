import { CronJob } from 'cron';
import schedulerClosingSvc from '~/services/schedulerClosingSvc';
import schedulerClosing from '~/services/schedulerClosingSvc';
import * as common from '~/utils/common';
import logger from '~/utils/logger';

const CRON_PATTERN = {
  every10s: '*/10 * * * * *',
  every5am: '15 7 * * *',
};

const cronJob: CronJob = new CronJob(CRON_PATTERN.every5am, async () => {
  try {
    logger.info('CRON', common.tanggal(new Date(), true));
    await schedulerClosingSvc.schedulerClosing();
    await schedulerClosingSvc.schedulerClosingTabemas();
  } catch (e) {
    logger.error(common.tanggal(new Date(), true), 'CRON');
  }
});

export default cronJob;
