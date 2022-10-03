import { Router } from 'express';

import * as reportController from '../../controllers/dashboardController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/', protect(), reportController.dashboard);

export default router;
