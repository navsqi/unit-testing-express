import { Router } from 'express';
import { basicAuth } from '~/middlewares/basicAuth';
import { uploadBuffer } from '~/utils/uploadFile';

import * as authController from '../../controllers/authController';
import { registerVal } from './../../validations/userVal';

const router = Router();

router.post(
  '/register',
  basicAuth,
  uploadBuffer([{ name: 'photo', maxCount: 4 }]),
  registerVal,
  authController.register,
);
router.post('/login/sso', basicAuth, authController.exchangeTokenSso);
router.post('/login', basicAuth, authController.login);

export default router;
