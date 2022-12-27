import { Router } from 'express';
import * as promoMicrositeController from '~/controllers/promoMicrositeController';
import { basicAuth } from '~/middlewares/basicAuth';
import protect from '~/middlewares/protect';
import { uploadBuffer } from '~/utils/uploadFile';

const router = Router();

router.get('/', basicAuth, promoMicrositeController.getPromoMicrosite);
router.get('/:id', basicAuth, promoMicrositeController.getDetailPromoMicrosite);
router.post(
  '/',
  protect(),
  uploadBuffer([{ name: 'photos', maxCount: 5 }]),
  promoMicrositeController.uploadPromoBanner,
);

router.delete('/:id', protect(), promoMicrositeController.deletePromoMicrosite);

export default router;
