import { Router } from 'express';

import * as roleController from '../../controllers/roleController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/', protect(), roleController.getRole);
router.get('/:id', protect(), roleController.getRoleById);
router.post('/', protect(), roleController.createNewRole);
router.patch('/:id', protect(), roleController.updateRole);
router.delete('/:id', protect(), roleController.deleteRole);

export default router;
