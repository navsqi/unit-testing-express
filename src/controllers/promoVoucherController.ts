import { NextFunction, Request, Response } from 'express';
import { Between, FindOptionsWhere, ILike } from 'typeorm';
import APIPegadaian from '~/apis/pegadaianApi';
import { dataSource } from '~/orm/dbCreateConnection';
import MasterStatusLos from '~/orm/entities/MasterStatusLos';
import PkiAgunan from '~/orm/entities/PkiAgunan';
import Promo from '~/orm/entities/Promo';
import PromoVoucher from '~/orm/entities/PromoVoucher';
import PkiNasabah from '~/orm/entities/PkiNasabah';
import PkiPengajuan from '~/orm/entities/PkiPengajuan';
import micrositeSvc from '~/services/micrositeSvc';
import reportSvc from '~/services/reportSvc';
import * as common from '~/utils/common';
import CustomError from '~/utils/customError';
import queryHelper from '~/utils/queryHelper';
import xls from '~/utils/xls';
import { parse } from 'csv-parse';
import validationCsv from '~/utils/validationCsv';

const promoRepo = dataSource.getRepository(Promo);
const promoVoucherRepo = dataSource.getRepository(PromoVoucher);

export const getPromoVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where: FindOptionsWhere<PromoVoucher> = {};

    const filter = {
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
      is_active: Number(req.query.is_active) ?? null,
    };

    if (filter.start_date) {
      where['start_date'] = filter.start_date;
    }

    if (filter.end_date) {
      where['end_date'] = filter.end_date;
    }

    filter.is_active === 1 ? (where['is_active'] = true) : (where['is_active'] = false);

    const paging = queryHelper.paging(req.query);
    const [promoVoucher, count] = await promoVoucherRepo.findAndCount({
      take: paging.limit,
      skip: paging.offset,
      where,
      order: {
        created_at: 'DESC',
      },
    });
    const dataRes = {
      promoVoucher,
    };

    return res.customSuccess(200, 'Get promo voucher success', dataRes, {
      count: count,
      rowCount: paging.limit,
      limit: paging.limit,
      offset: paging.offset,
      page: Number(req.query.page),
    });
  } catch (e) {
    return next(e);
  }
};

export const uploadVoucher = async (req: Request, res: Response, next: NextFunction) => {
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const bodies = req.body;
    let csv: Express.Multer.File = null;

    if (req.files && req.files['csv']) {
      csv = req.files['csv'][0];
    }

    const dataInput: PromoVoucher[] = [];

    let dataRes = {
      voucher: false,
    };

    common
      .bufferToStream(csv.buffer)
      .pipe(parse({ delimiter: ',', from_line: 2 }))
      .on('data', async (row) => {
        const voucher = new PromoVoucher();
        voucher.kode_voucher = row[0];
        voucher.promo_id = bodies.promo_id;
        voucher.start_date = row[1];
        voucher.end_date = row[2];
        voucher.jumlah_voucher = row[3];
        voucher.potongan_rp = row[4] ? row[4] : 0;
        voucher.tempat = row[5];
        voucher.potongan_persentase = row[6] ? row[6] : 0;
        voucher.minimal_rp = row[7];
        voucher.maksimal_rp = row[8];
        voucher.created_by = req.user.nik;
        voucher.updated_by = req.user.nik;
        voucher.total_promosi = bodies.total_promosi;
        voucher.is_active = true;

        dataInput.push(voucher);
      })
      .on('end', async () => {
        const voucherEntities = queryRunner.manager.create(PromoVoucher, dataInput);
        await queryRunner.manager.save(voucherEntities);

        dataRes = {
          voucher: true,
        };

        await queryRunner.commitTransaction();
        await queryRunner.release();

        return res.customSuccess(200, 'Upload voucher success', dataRes);
      })
      .on('error', async (error) => {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();

        return next(error);
      });
  } catch (e) {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();

    return next(e);
  }
};

export const updateVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dataRes = {};

    return res.customSuccess(200, 'Update voucher Success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const deleteVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dataRes = {};

    return res.customSuccess(200, 'Delete Voucher Success', dataRes);
  } catch (e) {
    return next(e);
  }
};
