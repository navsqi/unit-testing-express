import { Router } from 'express';

// import * as eventController from '../../controllers/eventController';
// import protect from '../../middlewares/protect';

const router = Router();

router.get('/', (req, res) => {
  res.send('Updated at 12/08/2022 14:02');
});

export default router;
