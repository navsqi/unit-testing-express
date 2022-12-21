import { Router } from 'express';

import * as promoController from '../../controllers/promoController';
import protect from '../../middlewares/protect';


const router = Router();

router.get('/', protect(), promoController.getPromo);
router.post('/', protect(), promoController.createNewPromo);

export default router;