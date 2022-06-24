import { Router } from 'express';

import * as instansiController from '../../controllers/instansiController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/', protect(), instansiController.getMasterInstansi);
router.post('/', protect(), instansiController.createNewInstansi);
router.patch('/:id', protect(), instansiController.updateMasterInstansi);

export default router;
