import { Router } from 'express';
import { basicAuth } from '~/middlewares/basicAuth';

import * as pkiController from '../../controllers/pkiController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/status-los', protect(), pkiController.getStatusLos);
router.post('/', basicAuth, pkiController.createNewPki);

export default router;
