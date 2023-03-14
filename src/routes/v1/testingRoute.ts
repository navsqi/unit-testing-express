import dayjs from 'dayjs';
import { Router } from 'express';
import { eventHandler } from '~/utils/connect';
import { basicAuth } from '~/middlewares/basicAuth';

const router = Router();

router.get('/', (req, res) => {
  res.send(`Executed at ${dayjs().format('DD/MM/YYYY HH:mm:ss')}, Updated at 14/03/2023 09:23`);
});

router.put('/closing-scheduler', basicAuth, async (req, res) => {
  eventHandler.emit('performBackgroundTask', 'send data');

  res.send(`Executed at ${dayjs().format('DD/MM/YYYY HH:mm:ss')}, Updated at 14/03/2023 09:23 | Cron dieksekusi`);
});

export default router;
