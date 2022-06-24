import { Router } from 'express';

import authRoute from './authRoute';
import userRoute from './userRoute';
import instansiRoute from './instansiRoute';

const router = Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/instansi', instansiRoute);

export default router;
