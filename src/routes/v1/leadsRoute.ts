import { Router } from 'express';
import protect from '~/middlewares/protect';
import { uploadBuffer } from '~/utils/uploadFile';

import * as leadsController from '../../controllers/leadsController';
import { inputLeadsBadanUsahaVal, inputLeadsVal } from '../../validations/leadsVal';

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
router.get('/nik-karyawan', protect(), leadsController.getNIKKaryawan);
router.get('/:leadsId', leadsController.getLeadsById);
router.get('/', protect(), leadsController.getLeads);
router.post('/perorangan', protect(), inputLeadsVal, leadsController.createNewLeadsPerorangan);
router.post('/badan-usaha', protect(), inputLeadsBadanUsahaVal, leadsController.createNewLeadsBadanUsaha);
router.patch('/:id/approve', protect(), leadsController.checkKTPAndApprove);
router.patch('/:id/reject', protect(), leadsController.rejectLeads);
router.patch('/:id', protect(), leadsController.updateLeads);

export default router;
