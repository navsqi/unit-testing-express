import { Router } from 'express';

import * as userController from '../../controllers/userController';

const router = Router();

router.get('/', userController.getUser);

export default router;
