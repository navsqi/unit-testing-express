import { Router } from 'express';

import * as reportController from '../../controllers/reportController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/leads', protect(), reportController.getReportLeads);

export default router;
