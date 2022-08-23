import { Router } from 'express';

import * as reportController from '../../controllers/reportController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/event', protect(), reportController.getReportEvent);
router.get('/instansi', protect(), reportController.getReportInstansi);
router.get('/leads', protect(), reportController.getReportLeads);
router.get('/closing', protect(), reportController.getReportClosing);

export default router;
