import { Router } from 'express';

import * as produkController from '../../controllers/produkController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/', protect(), produkController.getProduk);
router.post('/', protect(), produkController.createNewProduk);
router.patch('/:id', protect(), produkController.updateProduk);
router.delete('/:id', protect(), produkController.deleteProduk);

export default router;
