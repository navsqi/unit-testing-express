import { Router } from 'express';

import * as reportController from '../../controllers/reportController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/event', protect(), reportController.getReportEvent);
router.get('/event/excel', protect(), reportController.genExcelReportEvent);
router.get('/instansi', protect(), reportController.getReportInstansi);
router.get('/instansi/excel', protect(), reportController.genExcelReportInstansi);
router.get('/leads', protect(), reportController.getReportLeads);
router.get('/leads/excel', protect(), reportController.genExcelReportLeads);
router.get('/closing', protect(), reportController.getReportClosing);
router.get('/closing/excel', protect(), reportController.genExcelReportClosing);

export default router;
