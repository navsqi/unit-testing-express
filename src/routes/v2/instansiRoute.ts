import { Router } from 'express';

import * as instansiController from '../../controllers/instansiController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/child/excel', protect(), instansiController.genExcelInstansi);
router.get('/child/', protect(), instansiController.getInstansiV2);
router.get('/child/:id', protect(), instansiController.getInstansiById);

export default router;
