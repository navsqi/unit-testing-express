import { Router } from 'express';

import * as outletController from '../../controllers/outletController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/', protect(), outletController.getOutlet);
router.get('/session-konsol', protect(), outletController.getOutletSessionWithChild);

router.post('/', protect(), outletController.createNewOutlet);
router.patch('/:id', protect(), outletController.updateOutlet);
router.delete('/:id', protect(), outletController.deleteOutlet);

export default router;
