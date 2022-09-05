import { Router } from 'express';
import { basicAuth } from '~/middlewares/basicAuth';
import schedulerClosing from '~/services/schedulerClosingSvc';

// import * as eventController from '../../controllers/eventController';
// import protect from '../../middlewares/protect';

const router = Router();

router.get('/', (req, res) => {
  res.send('Updated at 31/08/2022 09:02');
});

router.put('/closing-scheduler', basicAuth, async (req, res) => {
  await schedulerClosing();

  res.send('Updated at 05/09/2022 11:35');
});

export default router;
