import { Router } from 'express';
import instansiVal from '~/validations/instansiVal';

import * as instansiController from '../../controllers/instansiController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/sarana-media', instansiController.getSaranaMedia);
router.get('/organisasi-pegawai', instansiController.getOrganisasiPegawai);

router.get('/parent/excel', protect(), instansiController.genExcelMasterInstansi);
router.get('/parent/', protect(), instansiController.getMasterInstansi);
router.get('/parent/:id', protect(), instansiController.getMasterInstansiById);
router.post('/parent/', protect(), instansiVal.masterInstansi, instansiController.createNewMasterInstansi);
router.patch('/parent/:id', protect(), instansiVal.masterInstansi, instansiController.updateMasterInstansi);
router.delete('/parent/:id', protect(), instansiVal.approveInstansi, instansiController.deleteMasterInstansi);

router.get('/child/excel', protect(), instansiController.genExcelInstansi);
router.get('/child/', protect(), instansiController.getInstansi);
router.get('/child/:id', protect(), instansiController.getInstansiById);
router.post('/child/', protect(), instansiVal.instansi, instansiController.createNewInstansi);
router.patch('/child/:id', protect(), instansiVal.instansi, instansiController.updateInstansi);
router.delete('/child/:id', protect(), instansiController.deleteInstansi);

export default router;
