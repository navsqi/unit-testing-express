import { NextFunction, Request, Response } from 'express';
import { konsolidasiTopBottom } from '~/services/konsolidasiSvc';
import { closingReport, eventReport, instansiReport, leadsReport } from '~/services/reportSvc';
import * as common from '~/utils/common';
import CustomError from '~/utils/customError';
import queryHelper from '~/utils/queryHelper';
import xls from '~/utils/xls';

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
      created_by: req.user.kode_role == 'MKTO' ? req.user.nik : req.query.created_by,
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

    return res.customSuccess(200, 'Get report event', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const genExcelReportEvent = async (req: Request, res: Response, next: NextFunction) => {
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
      created_by: req.user.kode_role == 'MKTO' ? req.user.nik : req.query.created_by,
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > 31) return next(new CustomError('Maksimal 31 hari', 400));

    const report = await eventReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls();

    const col = 13;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 25);
    }

    worksheet.cell(1, 1, 1, 9, true).string('DAFTAR NAMA MASTER INSTANSI').style(headingStyle);
    worksheet
      .cell(2, 1, 2, 9, true)
      .string(
        `TANGGAL ${common.tanggal(req.query.start_date as string)} S.D. ${common.tanggal(
          req.query.end_date as string,
        )}`,
      )
      .style(headingStyle);

    const barisHeading = 5;
    let noHeading = 0;

    const judulKolom = [
      'NO',
      'JENIS INSTANSI',
      'NAMA INSTANSI',
      'NO TELEPON',
      'EMAIL KANTOR',
      'NAMA KARYAWAN',
      'NO TELEPON KARYAWAN',
      'EMAIL KARYAWAN',
      'JABATAN KARYAWAN',
      'UNIT KERJA',
      'TANGGAL DIBUAT',
      'TANGGAL UPDATE',
      'NIK PEMBUAT',
    ];

    for (const header of judulKolom) {
      worksheet
        .cell(barisHeading, ++noHeading)
        .string(header)
        .style(outlineHeadingStyle);
    }

    let rows = 6;

    for (const [index, val] of report.data.entries()) {
      // let bodyLineNum = 1;
      // worksheet
      //   .cell(rows, 1)
      //   .string(`${index + 1}`)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.jenis_instansi)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.nama_instansi)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.no_telepon_instansi)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.email)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.nama_karyawan)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.no_telepon_karyawan)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.email_karyawan)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.jabatan_karyawan)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.cakupan_instansi.nama)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(common.tanggal(val.created_at))
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(common.tanggal(val.updated_at))
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.created_by)
      //   .style(outlineStyle);

      rows++;
    }

    const fileBuffer = await workbook.writeToBuffer();

    res.set({
      'Content-Disposition': `attachment; filename="MASTERINSTANSI-${Date.now()}.xlsx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return res.end(fileBuffer);
  } catch (e) {
    next(e);
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
      created_by: req.user.kode_role == 'MKTO' ? req.user.nik : req.query.created_by,
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

    return res.customSuccess(200, 'Get report instansi', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const genExcelReportInstansi = async (req: Request, res: Response, next: NextFunction) => {
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
      created_by: req.user.kode_role == 'MKTO' ? req.user.nik : req.query.created_by,
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > 31) return next(new CustomError('Maksimal 31 hari', 400));

    const report = await instansiReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls();

    const col = 13;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 25);
    }

    worksheet.cell(1, 1, 1, 9, true).string('DAFTAR NAMA MASTER INSTANSI').style(headingStyle);
    worksheet
      .cell(2, 1, 2, 9, true)
      .string(
        `TANGGAL ${common.tanggal(req.query.start_date as string)} S.D. ${common.tanggal(
          req.query.end_date as string,
        )}`,
      )
      .style(headingStyle);

    const barisHeading = 5;
    let noHeading = 0;

    const judulKolom = [
      'NO',
      'JENIS INSTANSI',
      'NAMA INSTANSI',
      'NO TELEPON',
      'EMAIL KANTOR',
      'NAMA KARYAWAN',
      'NO TELEPON KARYAWAN',
      'EMAIL KARYAWAN',
      'JABATAN KARYAWAN',
      'UNIT KERJA',
      'TANGGAL DIBUAT',
      'TANGGAL UPDATE',
      'NIK PEMBUAT',
    ];

    for (const header of judulKolom) {
      worksheet
        .cell(barisHeading, ++noHeading)
        .string(header)
        .style(outlineHeadingStyle);
    }

    let rows = 6;

    for (const [index, val] of report.data.entries()) {
      // let bodyLineNum = 1;
      // worksheet
      //   .cell(rows, 1)
      //   .string(`${index + 1}`)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.jenis_instansi)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.nama_instansi)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.no_telepon_instansi)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.email)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.nama_karyawan)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.no_telepon_karyawan)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.email_karyawan)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.jabatan_karyawan)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.cakupan_instansi.nama)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(common.tanggal(val.created_at))
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(common.tanggal(val.updated_at))
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.created_by)
      //   .style(outlineStyle);

      rows++;
    }

    const fileBuffer = await workbook.writeToBuffer();

    res.set({
      'Content-Disposition': `attachment; filename="MASTERINSTANSI-${Date.now()}.xlsx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return res.end(fileBuffer);
  } catch (e) {
    next(e);
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
      created_by: req.user.kode_role == 'MKTO' ? req.user.nik : req.query.created_by,
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

export const genExcelReportLeads = async (req: Request, res: Response, next: NextFunction) => {
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
      created_by: req.user.kode_role == 'MKTO' ? req.user.nik : req.query.created_by,
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > 31) return next(new CustomError('Maksimal 31 hari', 400));

    const report = await leadsReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls();

    const col = 13;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 25);
    }

    worksheet.cell(1, 1, 1, 9, true).string('DAFTAR NAMA MASTER INSTANSI').style(headingStyle);
    worksheet
      .cell(2, 1, 2, 9, true)
      .string(
        `TANGGAL ${common.tanggal(req.query.start_date as string)} S.D. ${common.tanggal(
          req.query.end_date as string,
        )}`,
      )
      .style(headingStyle);

    const barisHeading = 5;
    let noHeading = 0;

    const judulKolom = [
      'NO',
      'JENIS INSTANSI',
      'NAMA INSTANSI',
      'NO TELEPON',
      'EMAIL KANTOR',
      'NAMA KARYAWAN',
      'NO TELEPON KARYAWAN',
      'EMAIL KARYAWAN',
      'JABATAN KARYAWAN',
      'UNIT KERJA',
      'TANGGAL DIBUAT',
      'TANGGAL UPDATE',
      'NIK PEMBUAT',
    ];

    for (const header of judulKolom) {
      worksheet
        .cell(barisHeading, ++noHeading)
        .string(header)
        .style(outlineHeadingStyle);
    }

    let rows = 6;

    for (const [index, val] of report.data.entries()) {
      // let bodyLineNum = 1;
      // worksheet
      //   .cell(rows, 1)
      //   .string(`${index + 1}`)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.jenis_instansi)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.nama_instansi)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.no_telepon_instansi)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.email)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.nama_karyawan)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.no_telepon_karyawan)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.email_karyawan)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.jabatan_karyawan)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.cakupan_instansi.nama)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(common.tanggal(val.created_at))
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(common.tanggal(val.updated_at))
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.created_by)
      //   .style(outlineStyle);

      rows++;
    }

    const fileBuffer = await workbook.writeToBuffer();

    res.set({
      'Content-Disposition': `attachment; filename="MASTERINSTANSI-${Date.now()}.xlsx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return res.end(fileBuffer);
  } catch (e) {
    next(e);
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
      created_by: req.user.kode_role == 'MKTO' ? req.user.nik : req.query.created_by,
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

export const genExcelReportClosing = async (req: Request, res: Response, next: NextFunction) => {
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
      created_by: req.user.kode_role == 'MKTO' ? req.user.nik : req.query.created_by,
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > 31) return next(new CustomError('Maksimal 31 hari', 400));

    const report = await closingReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls();

    const col = 13;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 25);
    }

    worksheet.cell(1, 1, 1, 9, true).string('DAFTAR NAMA MASTER INSTANSI').style(headingStyle);
    worksheet
      .cell(2, 1, 2, 9, true)
      .string(
        `TANGGAL ${common.tanggal(req.query.start_date as string)} S.D. ${common.tanggal(
          req.query.end_date as string,
        )}`,
      )
      .style(headingStyle);

    const barisHeading = 5;
    let noHeading = 0;

    const judulKolom = [
      'NO',
      'JENIS INSTANSI',
      'NAMA INSTANSI',
      'NO TELEPON',
      'EMAIL KANTOR',
      'NAMA KARYAWAN',
      'NO TELEPON KARYAWAN',
      'EMAIL KARYAWAN',
      'JABATAN KARYAWAN',
      'UNIT KERJA',
      'TANGGAL DIBUAT',
      'TANGGAL UPDATE',
      'NIK PEMBUAT',
    ];

    for (const header of judulKolom) {
      worksheet
        .cell(barisHeading, ++noHeading)
        .string(header)
        .style(outlineHeadingStyle);
    }

    let rows = 6;

    for (const [index, val] of report.data.entries()) {
      // let bodyLineNum = 1;
      // worksheet
      //   .cell(rows, 1)
      //   .string(`${index + 1}`)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.jenis_instansi)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.nama_instansi)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.no_telepon_instansi)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.email)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.nama_karyawan)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.no_telepon_karyawan)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.email_karyawan)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.jabatan_karyawan)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.cakupan_instansi.nama)
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(common.tanggal(val.created_at))
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(common.tanggal(val.updated_at))
      //   .style(outlineStyle);
      // worksheet
      //   .cell(rows, ++bodyLineNum)
      //   .string(val.created_by)
      //   .style(outlineStyle);

      rows++;
    }

    const fileBuffer = await workbook.writeToBuffer();

    res.set({
      'Content-Disposition': `attachment; filename="MASTERINSTANSI-${Date.now()}.xlsx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return res.end(fileBuffer);
  } catch (e) {
    next(e);
  }
};
