import { NextFunction, Request, Response } from 'express';
import { approvedInstansi, approvedLeads, approvedMou, omsetPerKategoriProduk } from '~/services/dashboardSvc';
import { konsolidasiTopBottom } from '~/services/konsolidasiSvc';
import * as common from '~/utils/common';
import CustomError from '~/utils/customError';

export const dashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outletId = req.user.kode_unit_kerja;
    let outletIds = [];

    if (!outletId.startsWith('000')) {
      outletIds = await konsolidasiTopBottom(outletId);
    }

    const filter = {
      outlet_id: outletIds,
      created_by: common.isSalesRole(req.user.kode_role) ? req.user.nik : req.query.created_by,
      is_mo: common.isSalesRole(req.user.kode_role),
    };

    const approvedInstansiData = await approvedInstansi(filter);
    const approvedLeadsData = await approvedLeads(filter);
    const approvedMouData = await approvedMou(filter);
    const omset = await omsetPerKategoriProduk({ outlet_id: outletId, is_mo: filter.is_mo });

    if (approvedInstansiData.err || approvedLeadsData.err || approvedMouData.err || omset.err)
      return next(new CustomError('Terjadi kesalahan', 400));

    const dataRes = {
      dashboard: {
        ...approvedInstansiData.data,
        ...approvedLeadsData.data,
        ...approvedMouData.data,
        ...omset.data,
      },
    };

    return res.customSuccess(200, 'Get dashboard', dataRes);
  } catch (e) {
    return next(e);
  }
};
