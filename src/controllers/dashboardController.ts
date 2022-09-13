import { NextFunction, Request, Response } from 'express';
import { approvedInstansi, approvedLeads, approvedMou } from '~/services/dashboardSvc';
import { konsolidasiTopBottom } from '~/services/konsolidasiSvc';
import { closingReport, eventReport, instansiReport, leadsReport } from '~/services/reportSvc';
import * as common from '~/utils/common';
import CustomError from '~/utils/customError';
import { mapClosingReport, mapInstansiReport, mapLeadsReport } from '~/utils/mappingReport';
import queryHelper from '~/utils/queryHelper';
import xls from '~/utils/xls';

export const getApprovedInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outletId = (req.query.kode_unit_kerja || req.user.kode_unit_kerja) as string;
    let outletIds = [];

    if (!outletId.startsWith('000')) {
      outletIds = await konsolidasiTopBottom(outletId as string);
    }

    const filter = {
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
      outlet_id: outletIds,
      created_by: common.isSalesRole(req.user.kode_role) ? req.user.nik : req.query.created_by,
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > 31) return next(new CustomError('Maksimal 31 hari', 400));

    const approvedInstansiData = await approvedInstansi(filter);
    const approvedLeadsData = await approvedLeads(filter);
    const approvedMouData = await approvedMou(filter);

    if (approvedInstansiData.err || approvedLeadsData.err) return next(new CustomError('Terjadi kesalahan', 400));

    const dataRes = {
      dashboard: {
        ...approvedInstansiData.data,
        ...approvedLeadsData.data,
        ...approvedMouData.data,
      },
    };

    return res.customSuccess(200, 'Get report instansi', dataRes);
  } catch (e) {
    return next(e);
  }
};
