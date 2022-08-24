import { NextFunction, Request, Response } from 'express';
import { konsolidasiTopBottom } from '~/services/konsolidasiSrv';
import { closingReport, eventReport, instansiReport, leadsReport } from '~/services/reportSrv';
import * as common from '~/utils/common';
import CustomError from '~/utils/customError';

export const getReportEvent = async (req: Request, res: Response, next: NextFunction) => {
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
      user_id: req.user.kode_role == 'MKTO' ? req.user.id : null,
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > 31) return next(new CustomError('Maksimal 31 hari', 400));

    const report = await eventReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const dataRes = {
      meta: {
        count: report.data.length,
      },
      report: report.data,
    };

    return res.customSuccess(200, 'Get report leads', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getReportInstansi = async (req: Request, res: Response, next: NextFunction) => {
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
      user_id: req.user.kode_role == 'MKTO' ? req.user.id : null,
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > 31) return next(new CustomError('Maksimal 31 hari', 400));

    const report = await instansiReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const dataRes = {
      meta: {
        count: report.data.length,
      },
      report: report.data,
    };

    return res.customSuccess(200, 'Get report leads', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getReportLeads = async (req: Request, res: Response, next: NextFunction) => {
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
      user_id: req.user.kode_role == 'MKTO' ? req.user.id : null,
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > 31) return next(new CustomError('Maksimal 31 hari', 400));

    const report = await leadsReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const dataRes = {
      meta: {
        count: report.data.length,
      },
      report: report.data,
    };

    return res.customSuccess(200, 'Get report leads', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getReportClosing = async (req: Request, res: Response, next: NextFunction) => {
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
      user_id: req.user.kode_role == 'MKTO' ? req.user.id : null,
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > 31) return next(new CustomError('Maksimal 31 hari', 400));

    const report = await closingReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const dataRes = {
      meta: {
        count: report.data.length,
      },
      report: report.data,
    };

    return res.customSuccess(200, 'Get report leads', dataRes);
  } catch (e) {
    return next(e);
  }
};
