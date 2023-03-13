import { Router } from 'express';
import * as klaimMoController from '~/controllers/klaimMoController';
import protect from '~/middlewares/protect';

const router = Router();

router.post('/', protect(), klaimMoController.klaimMo);

export default router;
