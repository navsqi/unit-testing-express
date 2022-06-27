import { Router } from 'express';

import * as instansiController from '../../controllers/instansiController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/sarana-media', protect(), instansiController.getSaranaMedia);
router.get('/organisasi-pegawai', protect(), instansiController.getOrganisasiPegawai);

router.get('/parent/', protect(), instansiController.getMasterInstansi);
router.get('/parent/:id', protect(), instansiController.getMasterInstansiById);
router.post('/parent/', protect(), instansiController.createNewMasterInstansi);
router.patch('/parent/:id', protect(), instansiController.updateMasterInstansi);
router.delete('/parent/:id', protect(), instansiController.deleteMasterInstansi);

router.get('/child/', protect(), instansiController.getInstansi);
router.get('/child/:id', protect(), instansiController.getInstansiById);
router.post('/child/', protect(), instansiController.createNewInstansi);
router.patch('/child/:id', protect(), instansiController.updateInstansi);
router.delete('/child/:id', protect(), instansiController.deleteInstansi);

export default router;
