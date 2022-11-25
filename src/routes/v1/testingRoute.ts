import { Router } from 'express';
import { eventHandler } from '~/index';
import { basicAuth } from '~/middlewares/basicAuth';

const router = Router();

router.get('/', (req, res) => {
  res.send('Updated at 25/11/2022 14:58');
});

router.put('/closing-scheduler', basicAuth, async (req, res) => {
  eventHandler.emit('performBackgroundTask', 'ini data lho');

  res.send('Updated at 25/11/2022 14:58 | Cron dieksekusi');
});

export default router;
