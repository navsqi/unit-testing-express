import { Router } from 'express';
import { eventHandler } from '~/index';
import { basicAuth } from '~/middlewares/basicAuth';

const router = Router();

router.get('/', (req, res) => {
  res.send('Updated at 06/10/2022 10:38');
});

router.put('/closing-scheduler', basicAuth, async (req, res) => {
  eventHandler.emit('performBackgroundTask');

  res.send('Updated at 06/10/2022 10:38 | Cron dieksekusi');
});

export default router;
