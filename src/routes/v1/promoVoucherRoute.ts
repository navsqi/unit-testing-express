import { Router } from 'express';
import { eventHandler } from '~/index';
import { basicAuth } from '~/middlewares/basicAuth';
import protect from '~/middlewares/protect';
import { uploadBuffer } from '~/utils/uploadFile';
import * as promoVoucherController from '~/controllers/promoVoucherController';

const router = Router();

router.get('/', protect(), promoVoucherController.getPromoVoucher);
router.post(
  '/csv',
  protect(),
  uploadBuffer([{ name: 'csv', maxCount: 1 }], false),
  promoVoucherController.uploadVoucher,
);

export default router;
