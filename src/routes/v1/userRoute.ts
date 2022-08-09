import { Router } from 'express';

import * as userController from '../../controllers/userController';
import protect from './../../middlewares/protect';

const router = Router();

router.get('/', protect(), userController.getUser);

export default router;
