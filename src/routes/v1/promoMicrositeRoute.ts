import { Router } from 'express';
import { eventHandler } from '~/index';
import { basicAuth } from '~/middlewares/basicAuth';
import protect from '~/middlewares/protect';
import { uploadBuffer } from '~/utils/uploadFile';
import * as promoMicrositeController from '~/controllers/promoMicrositeController';

const router = Router();

router.get('/', protect(), promoMicrositeController.getPromoMicrosite);
router.get('/:id', protect(), promoMicrositeController.getDetailPromoMicrosite);
router.post(
  '/',
  protect(),
  uploadBuffer([{ name: 'photos', maxCount: 5 }]),
  promoMicrositeController.uploadPromoBanner,
);

export default router;
