import { Router } from 'express';

import * as userController from '../../controllers/userController';
import protect from './../../middlewares/protect';

const router = Router();

router.get('/', protect(['ADMINISTRATOR', 'STANDARD']), userController.getUser);

export default router;
