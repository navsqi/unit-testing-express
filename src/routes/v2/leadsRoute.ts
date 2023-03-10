import { Router } from 'express';
import protect from '~/middlewares/protect';

import * as leadsController from '../../controllers/leadsController';

const router = Router();

router.get('/excel', protect(), leadsController.genExcelLeadsV2);
router.get('/', protect(), leadsController.getLeadsV2);

export default router;
