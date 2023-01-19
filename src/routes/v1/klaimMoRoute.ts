import { Router } from 'express';
import { eventHandler } from '~/index';
import { basicAuth } from '~/middlewares/basicAuth';
import protect from '~/middlewares/protect';
import { uploadBuffer } from '~/utils/uploadFile';
import * as klaimMoController from '~/controllers/klaimMoController';

const router = Router();

router.post('/', protect(), klaimMoController.klaimMo);

export default router;
