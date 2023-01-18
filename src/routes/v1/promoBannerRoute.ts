import { Router } from 'express';
import { eventHandler } from '~/index';
import { basicAuth } from '~/middlewares/basicAuth';
import protect from '~/middlewares/protect';
import { uploadBuffer } from '~/utils/uploadFile';
import * as promoVoucherController from '~/controllers/promoVoucherController';

const router = Router();

router.post('/', protect(), uploadBuffer([{ name: 'photos', maxCount: 5 }]), promoVoucherController.uploadVoucher);

export default router;
