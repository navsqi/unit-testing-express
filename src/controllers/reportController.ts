import { NextFunction, Request, Response } from 'express';
import { konsolidasiTopBottom } from '~/services/konsolidasiSrv';
import { closingReport, leadsReport } from '~/services/reportSrv';
import * as common from '~/utils/common';
import CustomError from '~/utils/customError';

export const getReportLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outletId = req.query.outlet_id || req.user.kode_unit_kerja;
    let outletIds = [];

    if (outletId != '00002' && outletId != '00042') {
      outletIds = await konsolidasiTopBottom(outletId as string);
    }

    const filter = {
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
      outlet_id: outletIds,
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > 31) return next(new CustomError('Maksimal 31 hari', 400));

    const report = await leadsReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const dataRes = {
      report: report.data,
    };

    return res.customSuccess(200, 'Get report leads', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getReportClosing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outletId = req.query.outlet_id || req.user.kode_unit_kerja;
    let outletIds = [];

    if (outletId != '00002' && outletId != '00042') {
      outletIds = await konsolidasiTopBottom(outletId as string);
    }

    const filter = {
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
      outlet_id: outletIds,
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > 31) return next(new CustomError('Maksimal 31 hari', 400));

    const report = await closingReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const dataRes = {
      report: report.data,
    };

    return res.customSuccess(200, 'Get report leads', dataRes);
  } catch (e) {
    return next(e);
  }
};
