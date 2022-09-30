import { Router } from 'express';
import { basicAuth } from '~/middlewares/basicAuth';
import schedulerClosingSvc from '~/services/schedulerClosingSvc';

const router = Router();

router.get('/', (req, res) => {
  res.send('Updated at 28/09/2022 10:38');
});

router.put('/closing-scheduler', basicAuth, async (req, res) => {
  await schedulerClosingSvc.schedulerClosing();
  await schedulerClosingSvc.schedulerClosingTabemas();

  res.send('Updated at 28/09/2022 10:38');
});

export default router;
