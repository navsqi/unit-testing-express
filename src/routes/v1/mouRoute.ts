import { Router } from 'express';

import { uploadBuffer } from '~/utils/uploadFile';
import * as mouController from '../../controllers/mouController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/excel', protect(), mouController.genExcelMou);
router.get('/', protect(), mouController.getMou);
router.get('/:id', protect(), mouController.getMouById);
router.post('/', protect(), uploadBuffer([{ name: 'file', maxCount: 4 }]), mouController.createMou);
router.patch('/:id', protect(), mouController.updateMou);
router.delete('/:id', protect(), mouController.deleteMou);

export default router;
