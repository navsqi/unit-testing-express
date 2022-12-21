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

const promoRepo = dataSource.getRepository(Promo);
const promoVoucherRepo = dataSource.getRepository(PromoVoucher);

export const getPromoVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dataRes = {};

    return res.customSuccess(200, 'Get promo voucher success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const uploadVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dataRes = {};

    return res.customSuccess(200, 'Upload voucher success', dataRes);
  } catch (e) {
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
