import { Router } from 'express';

import * as promoController from '../../controllers/promoController';
import protect from '../../middlewares/protect';


const router = Router();

router.get('/', protect(), promoController.getPromo);
router.get('/dropdown', protect(), promoController.getPromoVoucher);
router.post('/', protect(), promoController.createNewPromo);
router.patch('/:id', protect(), promoController.updatePromo);
router.delete('/:id', protect(), promoController.deletePromo);

export default router;
