import { Router } from 'express';
import { eventHandler } from '~/index';
import { basicAuth } from '~/middlewares/basicAuth';
import protect from '~/middlewares/protect';
import { uploadBuffer } from '~/utils/uploadFile';
import * as promoVoucherController from '~/controllers/promoVoucherController';

const router = Router();

router.get('/', (req, res) => {
  res.send('Updated at 02/12/2022 11:29');
});

router.put('/closing-scheduler', basicAuth, async (req, res) => {
  eventHandler.emit('performBackgroundTask', 'ini data lho');

  res.send('Updated at 02/12/2022 11:29 | Cron dieksekusi');
});

router.post(
  '/csv',
  protect(),
  uploadBuffer([{ name: 'csv', maxCount: 1 }], false),
  promoVoucherController.uploadVoucher,
);

export default router;
