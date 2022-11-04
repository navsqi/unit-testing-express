import { Router } from 'express';
import { basicAuth } from '~/middlewares/basicAuth';

import * as pkiController from '../../controllers/pkiController';
import protect from '../../middlewares/protect';

const router = Router();

router.post('/los/pengajuan', protect(), pkiController.sendPengajuanToLos);

router.post('/', basicAuth, pkiController.createNewPki);
router.get('/', protect(), pkiController.getPki);
export default router;
