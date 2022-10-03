import { Router } from 'express';
import { uploadBuffer } from '~/utils/uploadFile';

import * as eventController from '../../controllers/eventController';
import protect, { cabangOnly } from '../../middlewares/protect';

const router = Router();

router.get('/', protect(), eventController.getEvent);
router.get('/:id', protect(), eventController.getEventById);
router.post('/', protect(), cabangOnly, uploadBuffer([{ name: 'file', maxCount: 4 }]), eventController.createEvent);
router.patch('/:id', protect(), uploadBuffer([{ name: 'file', maxCount: 4 }]), eventController.updateEvent);
router.delete('/:id', protect(), uploadBuffer([{ name: 'file', maxCount: 4 }]), eventController.deleteEvent);

export default router;
