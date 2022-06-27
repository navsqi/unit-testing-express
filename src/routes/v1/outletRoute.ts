import { Router } from 'express';

import * as outletController from '../../controllers/outletController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/', protect(['ADMINISTRATOR', 'STANDARD']), outletController.getOutlet);

export default router;
