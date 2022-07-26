import { Router } from 'express';
import { basicAuth } from '~/middlewares/basicAuth';
import protect from '~/middlewares/protect';
import { uploadBuffer } from '~/utils/uploadFile';

import * as authController from '../../controllers/authController';
import { registerVal } from './../../validations/userVal';

const router = Router();

router.post(
  '/register',
  basicAuth,
  uploadBuffer([{ name: 'photo', maxCount: 1 }]),
  registerVal,
  authController.register,
);
router.post('/login/sso', basicAuth, authController.exchangeTokenSso);
router.post('/login', basicAuth, authController.login);
router.put('/change-password/:nik', protect(), authController.changePassword);
router.put('/edit-profile/:nik', protect(), uploadBuffer([{ name: 'photo', maxCount: 1 }]), authController.editUser);

export default router;
