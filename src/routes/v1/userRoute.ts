import { Router } from 'express';
import { uploadBuffer } from '~/utils/uploadFile';
import userVal from '~/validations/userVal';

import * as userController from '../../controllers/userController';
import protect from './../../middlewares/protect';

const router = Router();

router.get('/', protect(), userController.getUser);
router.get('/:id', protect(), userController.getUserById);

router.put(
  '/edit-profile/:nik',
  protect(['ADMN', 'SADM']),
  userVal.editUserVal,
  uploadBuffer([{ name: 'photo', maxCount: 1 }]),
  userController.editUser,
);

export default router;
