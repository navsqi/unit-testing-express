import { Router } from 'express';
import * as promoVoucherController from '~/controllers/promoVoucherController';
import protect from '~/middlewares/protect';
import { uploadBuffer } from '~/utils/uploadFile';

const router = Router();

router.post('/', protect(), uploadBuffer([{ name: 'photos', maxCount: 5 }]), promoVoucherController.uploadVoucher);

export default router;
