import { Router } from 'express';

import authRoute from './authRoute';
import userRoute from './userRoute';
import instansiRoute from './instansiRoute';
import outletRoute from './outletRoute';
import mouRoute from './mouRoute';

const router = Router();

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/instansi', instansiRoute);
router.use('/outlet', outletRoute);
router.use('/mou', mouRoute);

export default router;
