import { Router } from 'express';

import * as produkController from '../../controllers/produkController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/', protect(), produkController.getProduk);

export default router;
