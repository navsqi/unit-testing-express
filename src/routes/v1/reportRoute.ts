import { Router } from 'express';

import * as reportController from '../../controllers/reportController';
import * as pkiController from '../../controllers/pkiController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/p2ki/excel', protect(), pkiController.genExcelReportPki);
router.get('/p2ki', protect(), pkiController.getReportPki);
router.get('/event', protect(), reportController.getReportEvent);
router.get('/event/excel', protect(), reportController.genExcelReportEvent);
router.get('/instansi', protect(), reportController.getReportInstansi);
router.get('/instansi/excel', protect(), reportController.genExcelReportInstansi);
router.get('/leads', protect(), reportController.getReportLeads);
router.get('/leads/excel', protect(), reportController.genExcelReportLeads);
router.get('/closing', protect(), reportController.getReportClosing);
router.get('/closing/excel', protect(), reportController.genExcelReportClosing);
router.get('/promosummary', protect(), reportController.getReportPromoSummary);
router.get('/promosummary/excel', protect(), reportController.genExcelReportPromoSummary);
router.get('/promoclosing', protect(), reportController.getReportPromoClosing);
router.get('/promoclosing/excel', protect(), reportController.genExcelReportPromoClosing);
router.get('/promoclosingv2', protect(), reportController.getReportPromoClosingV2);
router.get('/promoclosingv2/excel', protect(), reportController.genExcelReportPromoClosingV2);

export default router;
