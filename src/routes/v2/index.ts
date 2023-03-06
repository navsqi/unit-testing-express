import { Router } from 'express';

import instansiRoute from './instansiRoute';

const router = Router();

router.use('/instansi', instansiRoute);

export default router;
