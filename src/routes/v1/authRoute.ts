import { Router } from 'express';
import { uploadBuffer } from '~/utils/uploadFile';

import * as authController from '../../controllers/authController';
import { registerVal } from './../../validations/userVal';

const router = Router();

router.post('/register', uploadBuffer([{ name: 'photo', maxCount: 4 }]), registerVal, authController.register);
router.post('/login/sso', authController.exchangeTokenSso);
router.post('/login', authController.login);

export default router;
