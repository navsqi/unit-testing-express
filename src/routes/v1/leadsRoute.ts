import { Router } from 'express';
import protect from '~/middlewares/protect';
import { uploadBuffer } from '~/utils/uploadFile';

import * as leadsController from '../../controllers/leadsController';
import { inputLeadsVal } from '../../validations/leadsVal';

const router = Router();

router.post('/check/ktp-passion', protect(), leadsController.checkNasabahPeroranganByNikPassion);
router.post('/check/ktp-dukcapil', protect(), leadsController.checkNasabahPeroranganByNikDukcapil);
router.post('/check/perorangan', protect(), leadsController.checkNasabahPeroranganByNikDukcapil);
router.post('/check/perorangan-cif-passion', protect(), leadsController.getNasabahByCif);
router.post('/check/badan-usaha', protect(), leadsController.checkBadanUsahaByCif);
router.post(
  '/csv',
  protect(),
  uploadBuffer([{ name: 'csv', maxCount: 1 }], false),
  leadsController.createNewLeadsByCsv,
);
router.get('/:leadsId', leadsController.getLeadsById);
router.get('/', leadsController.getLeads);
router.post('/', protect(), inputLeadsVal, leadsController.createNewLeads);
router.patch('/:id', protect(), leadsController.updateLeads);

export default router;
