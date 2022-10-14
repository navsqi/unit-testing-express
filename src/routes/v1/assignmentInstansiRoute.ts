import { Router } from 'express';

import * as assignmentInstansiController from '../../controllers/assignmentInstansiController';
import protect from '../../middlewares/protect';

const router = Router();

router.get('/:userNik/instansi', protect(), assignmentInstansiController.getInstansiByAssignedUser);
router.get('/:instansiId/user', protect(), assignmentInstansiController.getAssignedUserByInstansi);
router.patch('/:id', protect(), assignmentInstansiController.updateAssignment);
router.post('/', protect(), assignmentInstansiController.assignUser);
router.delete('/:id', protect(), assignmentInstansiController.deleteAssignInstansi);

export default router;
