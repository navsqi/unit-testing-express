import { Router } from 'express';

import instansiRoute from './instansiRoute';
import leadsRoute from './leadsRoute';

const router = Router();

router.use('/instansi', instansiRoute);
router.use('/leads', leadsRoute);

export default router;
