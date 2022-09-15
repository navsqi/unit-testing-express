import { Router } from 'express';
import { basicAuth } from '~/middlewares/basicAuth';
import schedulerClosingSvc from '~/services/schedulerClosingSvc';
import schedulerClosing from '~/services/schedulerClosingSvc';

// import * as eventController from '../../controllers/eventController';
// import protect from '../../middlewares/protect';

const router = Router();

router.get('/', (req, res) => {
  res.send('Updated at 15/09/2022 09:02');
});

router.put('/closing-scheduler', basicAuth, async (req, res) => {
  await schedulerClosingSvc.schedulerClosing();
  await schedulerClosingSvc.schedulerClosingTabemas();

  res.send('Updated at 15/09/2022 11:35');
});

export default router;
