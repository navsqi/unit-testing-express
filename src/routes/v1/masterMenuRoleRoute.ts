import { Router } from 'express';
import menuVal from '~/validations/menuVal';

import * as masterMenuRoleController from '../../controllers/masterMenuRoleController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/', protect(), masterMenuRoleController.getMasterMenuRole);
router.get('/roles', protect(), masterMenuRoleController.getRoleMasterMenu);
router.patch('/batch', protect(), menuVal.updateAccessMenuVal, masterMenuRoleController.updateMasterMenu);

export default router;
