import { Router } from 'express';
import { basicAuth } from '~/middlewares/basicAuth';
import authVal from '~/validations/authVal';

import * as authController from '../../controllers/authController';

const router = Router();

router.post('/login', basicAuth, authVal.loginVal, authController.login);
router.post('/register', basicAuth, authVal.registerVal, authController.register);

export default router;
