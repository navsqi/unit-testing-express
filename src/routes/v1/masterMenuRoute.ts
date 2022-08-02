import { Router } from 'express';

import * as masterMenuController from '../../controllers/masterMenuController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/', protect(), masterMenuController.getMasterMenu);
router.get('/:id', protect(), masterMenuController.getMasterMenuById);
router.post('/', protect(), masterMenuController.createNewMasterMenu);
router.patch('/:id', protect(), masterMenuController.updateMasterMenu);

export default router;
