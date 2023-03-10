import dayjs from 'dayjs';
import { Router } from 'express';
import { eventHandler } from '~/index';
import { basicAuth } from '~/middlewares/basicAuth';

const router = Router();

router.get('/', (req, res) => {
  res.send(`Executed at ${dayjs().format('DD/MM/YYYY')}, Updated at 10/03/2023 14:15`);
});

router.put('/closing-scheduler', basicAuth, async (req, res) => {
  eventHandler.emit('performBackgroundTask', 'ini data lho');

  res.send(`Executed at ${dayjs().format('DD/MM/YYYY')}, Updated at 10/03/2023 14:15 | Cron dieksekusi`);
});

export default router;
