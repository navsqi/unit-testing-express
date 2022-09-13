import { NextFunction, Request, Response } from 'express';
import { konsolidasiTopBottom } from '~/services/konsolidasiSvc';
import { closingReport, eventReport, instansiReport, leadsReport } from '~/services/reportSvc';
import * as common from '~/utils/common';
import CustomError from '~/utils/customError';
import { mapClosingReport, mapInstansiReport, mapLeadsReport } from '~/utils/mappingReport';
import queryHelper from '~/utils/queryHelper';
import xls from '~/utils/xls';

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

    const data = mapInstansiReport(report.data);

    const dataRes = {
      meta: {
        count: report.data.length,
      },
      report: data,
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

    const data = mapInstansiReport(report.data);

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls();

    const col = 18;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 25);
    }

    worksheet.cell(1, 1, 1, 9, true).string('REPORT INSTANSI').style(headingStyle);
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
      'CREATE DATE',
      'ID INSTANSI',
      'KANWIL',
      'AREA',
      'CABANG',
      'NAMA INSTANSI',
      'MASTER INSTANSI',
      'JENIS INSTANSI',
      'KATEGORI INSTANSI',
      'STATUS POTENSIAL',
      'OMSET',
      'OSL',
      'SALDO TE',
      'TOTAL MOU',
      'TOTAL PKS',
      'TANGGAL UPDATE',
      'USER UPDATE',
    ];

    for (const header of judulKolom) {
      worksheet
        .cell(barisHeading, ++noHeading)
        .string(header)
        .style(outlineHeadingStyle);
    }

    let rows = 6;

    const valueKolom = [
      { property: 'created_at', isMoney: false, isDate: true },
      { property: 'id_instansi', isMoney: false, isDate: false },
      { property: 'outlet_4', isMoney: false, isDate: false },
      { property: 'outlet_3', isMoney: false, isDate: false },
      { property: 'outlet_2', isMoney: false, isDate: false },
      { property: 'nama_instansi', isMoney: false, isDate: false },
      { property: 'nama_master_instansi', isMoney: false, isDate: false },
      { property: 'jenis_instansi', isMoney: false, isDate: false },
      { property: 'kategori_instansi', isMoney: false, isDate: false },
      { property: 'status_potensial', isMoney: false, isDate: false },
      { property: 'omset', isMoney: true, isDate: false },
      { property: 'osl', isMoney: true, isDate: false },
      { property: 'saldo_tabemas', isMoney: false, isDate: false },
      { property: 'jumlah_mou', isMoney: false, isDate: false },
      { property: 'jumlah_pks', isMoney: false, isDate: false },
      { property: 'updated_at', isMoney: false, isDate: true },
      { property: 'updated_by', isMoney: false, isDate: false },
    ];

    for (const [index, val] of data.entries()) {
      let bodyLineNum = 1;
      worksheet
        .cell(rows, 1)
        .string(`${index + 1}`)
        .style(outlineStyle);

      for (const col of valueKolom) {
        let data = String(val[col.property]);

        if (col.isDate) {
          data = common.tanggal(val[col.property]);
        }

        if (col.isMoney) {
          data = common.rupiah(+val[col.property], false);
        }

        worksheet
          .cell(rows, ++bodyLineNum)
          .string(data)
          .style(outlineStyle);
      }

      rows++;
    }

    const fileBuffer = await workbook.writeToBuffer();

    res.set({
      'Content-Disposition': `attachment; filename="REPORTINSTANSI-${Date.now()}.xlsx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return res.end(fileBuffer);
  } catch (e) {
    next(e);
  }
};

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

    const data = mapInstansiReport(report.data);

    const dataRes = {
      meta: {
        count: report.data.length,
      },
      report: data,
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

    const data = mapInstansiReport(report.data);

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls();

    const col = 16;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 25);
    }

    worksheet.cell(1, 1, 1, 9, true).string('REPORT EVENT').style(headingStyle);
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
      'NAMA USER',
      'JENIS AKTIVITAS',
      'INSTANSI',
      'TANGGAL AKTIVITAS',
      'NAMA EVENT',
      'PIC INSTANSI',
      'NOMOR HP PIC',
      'FOTO',
      'KETERANGAN',
      'JUMLAH PROSPEK',
      'CABANG',
      'AREA',
      'KANWIL',
      'TANGGAL INPUT',
    ];

    for (const header of judulKolom) {
      worksheet
        .cell(barisHeading, ++noHeading)
        .string(header)
        .style(outlineHeadingStyle);
    }

    let rows = 6;

    const valueKolom = [
      { property: 'created_by', isMoney: false, isDate: false },
      { property: 'jenis_event', isMoney: false, isDate: false },
      { property: 'nama_instansi', isMoney: false, isDate: false },
      { property: 'tanggal_event', isMoney: false, isDate: true },
      { property: 'nama_event', isMoney: false, isDate: false },
      { property: 'nama_pic', isMoney: false, isDate: false },
      { property: 'nomor_hp_pic', isMoney: false, isDate: false },
      { property: 'foto_dokumentasi', isMoney: false, isDate: false },
      { property: 'keterangan', isMoney: false, isDate: false },
      { property: 'jumlah_prospek', isMoney: false, isDate: false },
      { property: 'outlet_4', isMoney: false, isDate: false },
      { property: 'outlet_3', isMoney: false, isDate: false },
      { property: 'outlet_2', isMoney: false, isDate: false },
      { property: 'created_at', isMoney: false, isDate: false },
    ];

    for (const [index, val] of data.entries()) {
      let bodyLineNum = 1;
      worksheet
        .cell(rows, 1)
        .string(`${index + 1}`)
        .style(outlineStyle);

      for (const col of valueKolom) {
        let data = String(val[col.property]);

        if (col.isDate) {
          data = common.tanggal(val[col.property]);
        }

        if (col.isMoney) {
          data = common.rupiah(+val[col.property], false);
        }

        worksheet
          .cell(rows, ++bodyLineNum)
          .string(data)
          .style(outlineStyle);
      }

      rows++;
    }

    const fileBuffer = await workbook.writeToBuffer();

    res.set({
      'Content-Disposition': `attachment; filename="REPORTEVENT-${Date.now()}.xlsx"`,
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

    const data = mapLeadsReport(report.data);

    const dataRes = {
      meta: {
        count: report.data.length,
      },
      report: data,
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

    const data = mapLeadsReport(report.data);

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls();

    const col = 21;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 25);
    }

    worksheet.cell(1, 1, 1, 9, true).string('REPORT LEADS').style(headingStyle);
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
      'NOMOR KTP NASABAH',
      'NAMA NASABAH',
      'NOMOR HP NASABAH',
      'STATUS KARYAWAN',
      'PRODUK',
      'CIF',
      'OMSET',
      'OSL',
      'SALDO TE',
      'NAMA INSTANSI',
      'KATEGORI INSTANSI',
      'JENIS EVENT',
      'NAMA EVENT',
      'USER INPUT',
      'CABANG',
      'AREA',
      'KAMWIL',
      'TANGGAL INPUT',
      'STATUS PROSPEK',
      'STATUS NIK KTP',
    ];

    for (const header of judulKolom) {
      worksheet
        .cell(barisHeading, ++noHeading)
        .string(header)
        .style(outlineHeadingStyle);
    }

    let rows = 6;

    const valueKolom = [
      { property: 'nik_ktp_nasabah', isMoney: false, isDate: false },
      { property: 'nama_nasabah', isMoney: false, isDate: false },
      { property: 'no_hp_nasabah', isMoney: false, isDate: false },
      { property: 'is_karyawan', isMoney: false, isDate: false },
      { property: 'nama_produk', isMoney: false, isDate: false },
      { property: 'cif', isMoney: false, isDate: false },
      { property: 'omset', isMoney: true, isDate: false },
      { property: 'osl', isMoney: false, isDate: false },
      { property: 'saldo_tabemas', isMoney: false, isDate: false },
      { property: 'nama_instansi', isMoney: false, isDate: false },
      { property: 'kategori_instansi', isMoney: false, isDate: false },
      { property: 'jenis_event', isMoney: false, isDate: false },
      { property: 'nama_event', isMoney: false, isDate: false },
      { property: 'created_by', isMoney: false, isDate: false },
      { property: 'outlet_4', isMoney: false, isDate: false },
      { property: 'outlet_3', isMoney: false, isDate: false },
      { property: 'outlet_2', isMoney: false, isDate: false },
      { property: 'created_at', isMoney: false },
      { property: 'step', isMoney: false, isDate: false },
      { property: 'is_ktp_valid', isMoney: false, isDate: false },
    ];

    for (const [index, val] of data.entries()) {
      let bodyLineNum = 1;
      worksheet
        .cell(rows, 1)
        .string(`${index + 1}`)
        .style(outlineStyle);

      for (const col of valueKolom) {
        let data = String(val[col.property]);

        if (col.isDate) {
          data = common.tanggal(val[col.property]);
        }

        if (col.isMoney) {
          data = common.rupiah(+val[col.property], false);
        }

        worksheet
          .cell(rows, ++bodyLineNum)
          .string(data)
          .style(outlineStyle);
      }

      rows++;
    }

    const fileBuffer = await workbook.writeToBuffer();

    res.set({
      'Content-Disposition': `attachment; filename="REPORTLEADS-${Date.now()}.xlsx"`,
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

    const data = mapClosingReport(report.data);

    const dataRes = {
      meta: {
        count: report.data.length,
      },
      report: data,
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

    const data = mapClosingReport(report.data);

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls();

    const col = 16;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 25);
    }

    worksheet.cell(1, 1, 1, 9, true).string('REPORT CLOSING').style(headingStyle);
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
      'TANGGAL KREDIT',
      'MASTER INSTANSI',
      'INSTANSI',
      'CHANNEL',
      'CIF',
      'NIK KTP NASABAH',
      'NAMA NASABAH',
      'PRODUK',
      'NO KONTRAK',
      'OMSET',
      'OSL',
      'SALDO TABEMAS',
      'CABANG',
      'AREA',
      'KANWIL',
    ];

    for (const header of judulKolom) {
      worksheet
        .cell(barisHeading, ++noHeading)
        .string(header)
        .style(outlineHeadingStyle);
    }

    let rows = 6;

    const valueKolom = [
      { property: 'tgl_kredit', isMoney: false, isDate: true },
      { property: 'nama_master_instansi', isMoney: false, isDate: false },
      { property: 'nama_instansi', isMoney: false, isDate: false },
      { property: 'channel', isMoney: false, isDate: false },
      { property: 'cif', isMoney: false, isDate: false },
      { property: 'nik_ktp_nasabah', isMoney: false, isDate: false },
      { property: 'nama_nasabah', isMoney: false, isDate: false },
      { property: 'nama_produk', isMoney: false, isDate: false },
      { property: 'no_kontrak', isMoney: false, isDate: false },
      { property: 'omset', isMoney: true, isDate: false },
      { property: 'osl', isMoney: false, isDate: false },
      { property: 'saldo_tabemas', isMoney: false, isDate: false },
      { property: 'outlet_4', isMoney: false, isDate: false },
      { property: 'outlet_3', isMoney: false, isDate: false },
      { property: 'outlet_2', isMoney: false, isDate: false },
    ];

    for (const [index, val] of data.entries()) {
      let bodyLineNum = 1;
      worksheet
        .cell(rows, 1)
        .string(`${index + 1}`)
        .style(outlineStyle);

      for (const col of valueKolom) {
        let data = String(val[col.property]);

        if (col.isDate) {
          data = common.tanggal(val[col.property]);
        }

        if (col.isMoney) {
          data = common.rupiah(+val[col.property], false);
        }

        worksheet
          .cell(rows, ++bodyLineNum)
          .string(data)
          .style(outlineStyle);
      }

      rows++;
    }

    const fileBuffer = await workbook.writeToBuffer();

    res.set({
      'Content-Disposition': `attachment; filename="REPORTCLOSING-${Date.now()}.xlsx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return res.end(fileBuffer);
  } catch (e) {
    next(e);
  }
};
