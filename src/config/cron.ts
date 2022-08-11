import { CronJob } from 'cron';
import * as common from '~/utils/common';

const CRON_PATTERN = {
  every10s: '*/10 * * * * *',
  every5am: '0 5 * * *',
};

const cronJob: CronJob = new CronJob(CRON_PATTERN.every10s, async () => {
  try {
    console.log('cron', `[${common.tanggal(new Date(), true)}] cron info`);
  } catch (e) {
    console.log('cron', `[${common.tanggal(new Date(), true)}] ${JSON.stringify(e.message)}`);
  }
});

export default cronJob;
