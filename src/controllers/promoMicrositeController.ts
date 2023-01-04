import { NextFunction, Request, Response } from 'express';
import { Between, FindOptionsWhere, ILike, In, LessThanOrEqual, MoreThanOrEqual, Raw } from 'typeorm';
import APIPegadaian from '~/apis/pegadaianApi';
import { dataSource } from '~/orm/dbCreateConnection';
import MasterStatusLos from '~/orm/entities/MasterStatusLos';
import PkiAgunan from '~/orm/entities/PkiAgunan';
import Promo from '~/orm/entities/Promo';
import PromoVoucher from '~/orm/entities/PromoVoucher';
import PromoMicrosite from '~/orm/entities/PromoMicrosite';
import PkiNasabah from '~/orm/entities/PkiNasabah';
import PkiPengajuan from '~/orm/entities/PkiPengajuan';
import micrositeSvc from '~/services/micrositeSvc';
import reportSvc from '~/services/reportSvc';
import * as common from '~/utils/common';
import CustomError from '~/utils/customError';
import queryHelper from '~/utils/queryHelper';
import xls from '~/utils/xls';
import { objectRemove, objectUpload } from '~/config/minio';
import PromoBanner from '~/orm/entities/PromoBanner';
import PromoMicrositePhoto from '~/orm/entities/PromoMicrositePhoto';
import dayjs from 'dayjs';

const promoRepo = dataSource.getRepository(Promo);
const promoVoucherRepo = dataSource.getRepository(PromoVoucher);
const promoMicrositeRepo = dataSource.getRepository(PromoMicrosite);
const promoMicrositePhotoRepo = dataSource.getRepository(PromoMicrositePhoto);

export const getPromoMicrosite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [promoMicrosite, count] = await promoMicrositeRepo.findAndCount({
      where: {
        start_date: Raw((alias) => `CURRENT_DATE >= ${alias}`),
        end_date: Raw((alias) => `CURRENT_DATE <= ${alias}`),
        is_active: true,
        is_deleted: false,
      },
    });

    for (const promo of promoMicrosite) {
      const photos = await promoMicrositePhotoRepo.findOne({
        where: { promo_microsite_id: promo.id },
        order: { id: 'asc' },
      });
      promo.thumbnail = photos.photo;
    }

    const dataRes = {
      promoMicrosite,
    };

    return res.customSuccess(200, 'Get promo voucher success', dataRes, { count: count });
  } catch (e) {
    return next(e);
  }
};

export const getDetailPromoMicrosite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const promoMicrositeId = Number(req.params.id) as number;
    const promoMicrosite = await promoMicrositeRepo.findOne({
      where: {
        start_date: Raw((alias) => `CURRENT_DATE >= ${alias}`),
        end_date: Raw((alias) => `CURRENT_DATE <= ${alias}`),
        is_active: true,
        is_deleted: false,
        id: promoMicrositeId,
      },
      relations: {
        promo: true,
      },
    });

    if (!promoMicrosite) return next(new CustomError('Data promo microsite tidak ditemukan', 404));

    const photos = await promoMicrositePhotoRepo.find({
      where: { promo_microsite_id: promoMicrosite.id },
      order: { id: 'asc' },
    });

    if (photos && photos.length > 1) {
      promoMicrosite.thumbnail = photos[0].photo;
      promoMicrosite.photos = photos;
    }

    const promosId = promoMicrosite.promo.map((el) => el.promo_id);
    const promo = await promoRepo.find({
      select: {
        produk: {
          nama_produk: true,
        },
      },
      where: { id: In(promosId) },
      order: { id: 'asc' },
      relations: {
        produk: true,
      },
    });
    promoMicrosite.promos = promo;

    const dataRes = {
      promoMicrosite,
    };

    return res.customSuccess(200, 'Get promo voucher success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const uploadPromoBanner = async (req: Request, res: Response, next: NextFunction) => {
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  let fileName: string = null;
  const filesName: string[] = [];
  const photoRes: any[] = [];

  try {
    const bodies = req.body;

    let photo: Express.Multer.File = null;
    const promoMicrosite = new PromoMicrosite();

    if (req.files && req.files['photos']) {
      for (const f of req.files['photos'] as Express.Multer.File[]) {
        photo = f;
        fileName = 'hblpromo/' + common.generateFileName(photo.originalname);

        await objectUpload(process.env.MINIO_BUCKET, fileName, photo.buffer, {
          'Content-Type': photo.mimetype,
          'Content-Disposision': 'inline',
        });

        filesName.push(fileName);
      }
    }

    promoMicrosite.nama_promosi = bodies.nama_promosi;
    promoMicrosite.keterangan_promosi = bodies.keterangan_promosi;
    promoMicrosite.start_date = bodies.start_date;
    promoMicrosite.end_date = bodies.end_date;
    promoMicrosite.is_klaim_mo = bodies.is_klaim_mo == 'true' ? true : false;
    promoMicrosite.kelompok_produk = bodies.kelompok_produk;

    const promosId = bodies.promo_id;
    promoMicrosite.promo_id = promosId;

    const promoMicrositeRes = await queryRunner.manager.save(PromoMicrosite, promoMicrosite);

    for (const fn of filesName) {
      const savePhotoDb = await queryRunner.manager.save(PromoMicrositePhoto, {
        promo_microsite_id: promoMicrositeRes.id,
        photo: fn,
        created_by: req.user.nik,
      });

      photoRes.push(savePhotoDb);
    }

    const promosArr = JSON.parse(promosId);
    for (const prom of promosArr) {
      await queryRunner.manager.save(PromoBanner, {
        promo_id: prom,
        promo_microsite_id: promoMicrositeRes.id,
        created_by: req.user.nik,
      });
    }

    await queryRunner.commitTransaction();

    const dataRes = {
      promoMicrosite: promoMicrositeRes,
      photo: photoRes,
    };

    return res.customSuccess(200, 'Upload voucher success', dataRes);
  } catch (e) {
    await queryRunner.rollbackTransaction();

    for (const fn of filesName) {
      await objectRemove(process.env.MINIO_BUCKET, fn);
    }

    return next(e);
  }
};

export const updatePromoBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dataRes = {};

    return res.customSuccess(200, 'Update voucher Success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const deletePromoMicrosite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.params);
    const promoMicrositeId = Number(req.params.id) as number;
    const promoMicrosite = await promoMicrositeRepo.findOne({
      where: {
        id: promoMicrositeId,
      },
      relations: {
        promo: true,
      },
    });

    if (!promoMicrosite) return next(new CustomError('Data promo microsite tidak ditemukan', 404));

    const photos = await promoMicrositePhotoRepo.find({
      where: { promo_microsite_id: promoMicrosite.id },
      order: { id: 'asc' },
    });

    for (const photo of photos) {
      await objectRemove(process.env.MINIO_BUCKET, photo.photo);
    }

    await promoMicrositeRepo.delete({ id: promoMicrositeId });
    await promoMicrositePhotoRepo.delete({ promo_microsite_id: promoMicrositeId });

    const dataRes = {};

    return res.customSuccess(200, 'Delete Voucher Success', dataRes);
  } catch (e) {
    return next(e);
  }
};
