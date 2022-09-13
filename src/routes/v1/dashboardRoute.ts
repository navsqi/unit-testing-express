import { Router } from 'express';

import * as reportController from '../../controllers/dashboardController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/approved', protect(), reportController.getApprovedInstansi);

export default router;
