import { Router } from 'express';

import * as outletController from '../../controllers/outletController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/', protect(), outletController.getOutlet);
router.get('/session-konsol', protect(), outletController.getOutletSessionWithChild);

export default router;
