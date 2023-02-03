import { Router } from 'express';
import * as promoVoucherController from '~/controllers/promoVoucherController';
import protect from '~/middlewares/protect';
import { uploadBuffer } from '~/utils/uploadFile';

const router = Router();

router.get('/', protect(), promoVoucherController.getPromoVoucher);
router.post(
  '/csv',
  protect(),
  uploadBuffer([{ name: 'csv', maxCount: 1 }], false),
  promoVoucherController.uploadVoucher,
);

router.patch('/:id', protect(), promoVoucherController.updateVoucher);
router.delete('/bulk', protect(), promoVoucherController.deleteVoucherBulk);
router.delete('/:id', protect(), promoVoucherController.deleteVoucher);

export default router;
