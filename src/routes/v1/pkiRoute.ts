import { Router } from 'express';

import * as pkiController from '../../controllers/pkiController';
import protect from '../../middlewares/protect';

const router = Router();
router.get('/', protect(), pkiController.getPki);
router.post('/', protect(), pkiController.createNewPki);

export default router;
