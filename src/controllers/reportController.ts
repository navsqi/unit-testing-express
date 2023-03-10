import { NextFunction, Request, Response } from 'express';
import { konsolidasiTopBottom } from '~/services/konsolidasiSvc';
import {
  closingReport,
  eventReport,
  IFilterOSL,
  instansiReport,
  leadsReport,
  OSLReport,
  promosiClosingReport,
  promosiClosingReportV2,
  promosiReport,
} from '~/services/reportSvc';
import * as common from '~/utils/common';
import CustomError from '~/utils/customError';
import { mapClosingReport, mapEventReport, mapInstansiReport, mapLeadsReport } from '~/utils/mappingReport';
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
      created_by: common.isSalesRole(req.user.kode_role) ? req.user.nik : req.query.created_by,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 250,
      offset: null,
      master_instansi_id: (Number(req.query.master_instansi_id) as number) ?? null,
      jenis_instansi: req.query.jenis_instansi as string,
    };

    const paging = queryHelper.paging({ ...filter });
    filter.offset = paging.offset;
    filter.limit = paging.limit;

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > +process.env.DATERANGE_REPORT)
      return next(new CustomError(`Maksimal ${process.env.DATERANGE_REPORT} hari`, 400));

    const report = await instansiReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const data = mapInstansiReport(report.data);

    const dataRes = {
      meta: {
        count: report.count,
        rowCount: report.data.length,
        page: filter.page,
        limit: filter.limit,
        offset: filter.offset,
      },
      report: data,
    };

    return res.customSuccess(200, 'Get report instansi', dataRes, {
      count: report.count,
      rowCount: paging.limit,
      limit: paging.limit,
      offset: paging.offset,
      page: Number(req.query.page),
    });
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
      created_by: common.isSalesRole(req.user.kode_role) ? req.user.nik : req.query.created_by,
      master_instansi_id: (Number(req.query.master_instansi_id) as number) ?? null,
      jenis_instansi: req.query.jenis_instansi as string,
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > +process.env.DATERANGE_REPORT)
      return next(new CustomError(`Maksimal ${process.env.DATERANGE_REPORT} hari`, 400));

    const report = await instansiReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const data = mapInstansiReport(report.data);

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls('Report Instansi');

    const col = 20;

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
      'NAMA INSTANSI',
      'MASTER INSTANSI',
      'JENIS INSTANSI',
      'KATEGORI INSTANSI',
      'STATUS POTENSIAL',
      'CABANG',
      'KANWIL',
      'AREA',
      'OMSET',
      'OSL',
      'SALDO TE',
      'TOTAL AKTIVITAS',
      'TOTAL LEADS',
      'TOTAL MOU',
      'TOTAL PKS',
      'TANGGAL INPUT',
      'TANGGAL UPDATE',
      'NIK INPUT',
      'NAMA INPUT',
    ];

    for (const header of judulKolom) {
      worksheet
        .cell(barisHeading, ++noHeading)
        .string(header)
        .style(outlineHeadingStyle);
    }

    let rows = 6;

    const valueKolom = [
      { property: 'nama_instansi', isMoney: false, isDate: false },
      { property: 'nama_master_instansi', isMoney: false, isDate: false },
      { property: 'jenis_instansi', isMoney: false, isDate: false },
      { property: 'kategori_instansi', isMoney: false, isDate: false },
      { property: 'status_potensial', isMoney: false, isDate: false },
      { property: 'outlet_4', isMoney: false, isDate: false },
      { property: 'outlet_3', isMoney: false, isDate: false },
      { property: 'outlet_2', isMoney: false, isDate: false },
      { property: 'omset', isMoney: true, isDate: false },
      { property: 'osl', isMoney: true, isDate: false },
      { property: 'saldo_tabemas', isMoney: false, isDate: false },
      { property: 'jumlah_aktivitas', isMoney: false, isDate: false },
      { property: 'jumlah_leads', isMoney: false, isDate: false },
      { property: 'jumlah_mou', isMoney: false, isDate: false },
      { property: 'jumlah_pks', isMoney: false, isDate: false },
      { property: 'created_at', isMoney: false, isDate: true },
      { property: 'updated_at', isMoney: false, isDate: true },
      { property: 'nik_created_by', isMoney: false, isDate: false },
      { property: 'created_by', isMoney: false, isDate: false },
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
          .string(data && data != 'null' ? data : '-')
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
      created_by: common.isSalesRole(req.user.kode_role) ? req.user.nik : req.query.created_by,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 250,
      offset: null,
      jenis_aktivitas: req.query.jenis_aktivitas as string,
      instansi_id: Number(req.query.instansi_id) as number,
    };

    const paging = queryHelper.paging({ ...filter });
    filter.offset = paging.offset;
    filter.limit = paging.limit;

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > +process.env.DATERANGE_REPORT)
      return next(new CustomError(`Maksimal ${process.env.DATERANGE_REPORT} hari`, 400));

    const report = await eventReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const data = mapEventReport(report.data);

    const dataRes = {
      meta: {
        count: report.count,
        rowCount: report.data.length,
        page: filter.page,
        limit: filter.limit,
        offset: filter.offset,
      },
      report: data,
    };

    return res.customSuccess(200, 'Get report event', dataRes, {
      count: report.count,
      rowCount: paging.limit,
      limit: paging.limit,
      offset: paging.offset,
      page: Number(req.query.page),
    });
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
      created_by: common.isSalesRole(req.user.kode_role) ? req.user.nik : req.query.created_by,
      jenis_aktivitas: req.query.jenis_aktivitas as string,
      instansi_id: Number(req.query.instansi_id) as number,
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > +process.env.DATERANGE_REPORT)
      return next(new CustomError(`Maksimal ${process.env.DATERANGE_REPORT} hari`, 400));

    const report = await eventReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const data = mapEventReport(report.data);

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls('Report Event');

    const col = 20;

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
      'NIK MO',
      'NAMA MO',
      'JENIS AKTIVITAS',
      'MASTER INSTANSI',
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
      'OMSET',
      'OSL',
      'SALDO TABEMAS',
    ];

    for (const header of judulKolom) {
      worksheet
        .cell(barisHeading, ++noHeading)
        .string(header)
        .style(outlineHeadingStyle);
    }

    let rows = 6;

    const valueKolom = [
      { property: 'created_by_kode', isMoney: false, isDate: false },
      { property: 'created_by', isMoney: false, isDate: false },
      { property: 'jenis_event', isMoney: false, isDate: false },
      { property: 'nama_master_instansi', isMoney: false, isDate: false },
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
      { property: 'created_at', isMoney: false, isDate: true },
      { property: 'omset', isMoney: false, isDate: false },
      { property: 'osl', isMoney: false, isDate: false },
      { property: 'saldo_tabemas', isMoney: false, isDate: false },
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
          .string(data && data != 'null' ? data : '-')
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
      created_by: common.isSalesRole(req.user.kode_role) ? req.user.nik : req.query.created_by,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 250,
      offset: null,
    };

    const paging = queryHelper.paging({ ...filter });
    filter.offset = paging.offset;
    filter.limit = paging.limit;

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > +process.env.DATERANGE_REPORT)
      return next(new CustomError(`Maksimal ${process.env.DATERANGE_REPORT} hari`, 400));

    const report = await leadsReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const data = mapLeadsReport(report.data);

    const dataRes = {
      meta: {
        count: report.count,
        rowCount: report.data.length,
        page: filter.page,
        limit: filter.limit,
        offset: filter.offset,
      },
      report: data,
    };

    return res.customSuccess(200, 'Get report leads', dataRes, {
      count: report.count,
      rowCount: paging.limit,
      limit: paging.limit,
      offset: paging.offset,
      page: Number(req.query.page),
    });
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
      created_by: common.isSalesRole(req.user.kode_role) ? req.user.nik : req.query.created_by,
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > +process.env.DATERANGE_REPORT)
      return next(new CustomError(`Maksimal ${process.env.DATERANGE_REPORT} hari`, 400));

    const report = await leadsReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const data = mapLeadsReport(report.data);

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls('Report Leads');

    const col = 24;

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
      'NAMA',
      'NOMOR HP NASABAH',
      'STATUS KARYAWAN',
      'PRODUK',
      'CIF',
      'OMSET',
      'OSL',
      'SALDO TE',
      'NAMA MASTER INSTANSI',
      'NAMA INSTANSI',
      'KATEGORI INSTANSI',
      'JENIS EVENT',
      'NAMA EVENT',
      'USER INPUT',
      'CABANG',
      'AREA',
      'KAMWIL',
      'TANGGAL INPUT',
      'TANGGAL APPROVE',
      'STATUS NIK KTP',
      'NIK_MO',
      'NAMA_MO',
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
      { property: 'omset', isMoney: false, isDate: false },
      { property: 'osl', isMoney: false, isDate: false },
      { property: 'saldo_tabemas', isMoney: false, isDate: false },
      { property: 'nama_master_instansi', isMoney: false, isDate: false },
      { property: 'nama_instansi', isMoney: false, isDate: false },
      { property: 'kategori_instansi', isMoney: false, isDate: false },
      { property: 'jenis_event', isMoney: false, isDate: false },
      { property: 'nama_event', isMoney: false, isDate: false },
      { property: 'created_by', isMoney: false, isDate: false },
      { property: 'outlet_4', isMoney: false, isDate: false },
      { property: 'outlet_3', isMoney: false, isDate: false },
      { property: 'outlet_2', isMoney: false, isDate: false },
      { property: 'created_at', isMoney: false, isDate: true },
      { property: 'approved_at_leads', isMoney: false, isDate: true },
      { property: 'is_ktp_valid', isMoney: false, isDate: false },
      { property: 'created_by', isMoney: false, isDate: false },
      { property: 'nama_created_by', isMoney: false, isDate: false },
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
          .string(data && data != 'null' ? data : '-')
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
      is_mo: common.isSalesRole(req.user.kode_role, true),
      created_by: common.isSalesRole(req.user.kode_role) ? req.user.nik : req.query.created_by,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 250,
      offset: null,
      order_by: req.query.order_by,
      order_type: req.query.order_type,
    };

    const paging = queryHelper.paging({ ...filter });
    filter.offset = paging.offset;
    filter.limit = paging.limit;

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > +process.env.DATERANGE_REPORT)
      return next(new CustomError(`Maksimal ${process.env.DATERANGE_REPORT} hari`, 400));

    const report = await closingReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const data = mapClosingReport(report.data);

    const dataRes = {
      meta: {
        count: report.count,
        rowCount: report.data.length,
        page: filter.page,
        limit: filter.limit,
        offset: filter.offset,
      },
      report: data,
    };

    return res.customSuccess(200, 'Get report leads', dataRes, {
      count: report.count,
      rowCount: paging.limit,
      limit: paging.limit,
      offset: paging.offset,
      page: Number(req.query.page),
    });
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
      is_mo: common.isSalesRole(req.user.kode_role, true),
      created_by: common.isSalesRole(req.user.kode_role) ? req.user.nik : req.query.created_by,
      order_by: req.query.order_by,
      order_type: req.query.order_type,
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > +process.env.DATERANGE_REPORT)
      return next(new CustomError(`Maksimal ${process.env.DATERANGE_REPORT} hari`, 400));

    const report = await closingReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const data = mapClosingReport(report.data);

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls('Report Closing');

    const col = 23;

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
      'CABANG LEADS',
      'MASTER INSTANSI',
      'INSTANSI',
      'NIK MO',
      'NAMA MO',
      'KANWIL TRANSAKSI',
      'AREA TRANSAKSI',
      'CABANG TRANSAKSI',
      'KODE CABANG TRANSAKSI',
      'OUTLET TRANSAKSI',
      'KODE OUTLET TRANSAKSI',
      'CHANNEL SYARIAH',
      'CHANNEL',
      'CIF',
      'NIK KTP',
      'NAMA',
      'PRODUK',
      'NO KREDIT',
      'OMSET',
      'TANGGAL INPUT LEADS',
      'TANGGAL APPROVE LEADS',
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
      { property: 'outlet_leads', isMoney: false, isDate: false },
      { property: 'nama_master_instansi', isMoney: false, isDate: false },
      { property: 'nama_instansi', isMoney: false, isDate: false },
      { property: 'nik_mo', isMoney: false, isDate: false },
      { property: 'nama_mo', isMoney: false, isDate: false },
      { property: 'outlet_2', isMoney: false, isDate: false },
      { property: 'outlet_3', isMoney: false, isDate: false },
      { property: 'nama_cabang_transaksi', isMoney: false, isDate: false },
      { property: 'kode_cabang_transaksi', isMoney: false, isDate: false },
      { property: 'outlet_4', isMoney: false, isDate: false },
      { property: 'kode_outlet', isMoney: false, isDate: false },
      { property: 'channel_syariah', isMoney: false, isDate: false },
      { property: 'channel', isMoney: false, isDate: false },
      { property: 'cif', isMoney: false, isDate: false },
      { property: 'nik_ktp_nasabah', isMoney: false, isDate: false },
      { property: 'nama_nasabah', isMoney: false, isDate: false },
      { property: 'nama_produk', isMoney: false, isDate: false },
      { property: 'no_kontrak', isMoney: false, isDate: false },
      { property: 'omset', isMoney: false, isDate: false },
      { property: 'created_at_leads', isMoney: false, isDate: true },
      { property: 'approved_at_leads', isMoney: false, isDate: true },
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
          .string(data && data != 'null' ? data : '-')
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

export const getReportOSL = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outletId = (req.query.kode_unit_kerja || req.user.kode_unit_kerja) as string;
    let outletIds = [];

    if (!outletId.startsWith('000')) {
      outletIds = await konsolidasiTopBottom(outletId as string);
    }

    const filter: IFilterOSL = {
      date: (req.query.date as string) || '',
      outlet_id: outletIds,
      is_mo: common.isSalesRole(req.user.kode_role, true),
      created_by: common.isSalesRole(req.user.kode_role) ? req.user.nik : req.query.created_by,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 250,
      offset: null,
      order_by: req.query.order_by,
      order_type: req.query.order_type,
    };

    const paging = queryHelper.paging({ ...filter });
    filter.offset = paging.offset;
    filter.limit = paging.limit;

    const report = await OSLReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const data = mapClosingReport(report.data);

    const dataRes = {
      meta: {
        count: report.count,
        rowCount: report.data.length,
        page: filter.page,
        limit: filter.limit,
        offset: filter.offset,
      },
      report: data,
    };

    return res.customSuccess(200, 'Get report OSL', dataRes, {
      count: report.count,
      rowCount: paging.limit,
      limit: paging.limit,
      offset: paging.offset,
      page: Number(req.query.page),
    });
  } catch (e) {
    return next(e);
  }
};

export const genExcelReportOSL = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outletId = (req.query.kode_unit_kerja || req.user.kode_unit_kerja) as string;
    let outletIds = [];

    if (!outletId.startsWith('000')) {
      outletIds = await konsolidasiTopBottom(outletId as string);
    }

    const filter: IFilterOSL = {
      date: (req.query.date as string) || '',
      outlet_id: outletIds,
      is_mo: common.isSalesRole(req.user.kode_role, true),
      created_by: common.isSalesRole(req.user.kode_role) ? req.user.nik : req.query.created_by,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 250,
      offset: null,
      order_by: req.query.order_by,
      order_type: req.query.order_type,
    };

    const report = await OSLReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const data = mapClosingReport(report.data);

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls('Report OSL');

    const col = 24;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 25);
    }

    worksheet.cell(1, 1, 1, 9, true).string('REPORT OSL').style(headingStyle);
    worksheet
      .cell(2, 1, 2, 9, true)
      .string(`TANGGAL ${common.tanggal(filter.date as string)}`)
      .style(headingStyle);

    const barisHeading = 5;
    let noHeading = 0;

    const judulKolom = [
      'NO',
      'TANGGAL KREDIT',
      'CABANG LEADS',
      'MASTER INSTANSI',
      'INSTANSI',
      'NIK MO',
      'NAMA MO',
      'KANWIL TRANSAKSI',
      'AREA TRANSAKSI',
      'CABANG TRANSAKSI',
      'KODE CABANG TRANSAKSI',
      'OUTLET TRANSAKSI',
      'KODE OUTLET TRANSAKSI',
      'CHANNEL SYARIAH',
      'CHANNEL',
      'CIF',
      'NIK KTP',
      'NAMA',
      'PRODUK',
      'NO KREDIT',
      'OSL',
      'SALDO TABEMAS',
      'TANGGAL INPUT LEADS',
      'TANGGAL APPROVE LEADS',
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
      { property: 'outlet_leads', isMoney: false, isDate: false },
      { property: 'nama_master_instansi', isMoney: false, isDate: false },
      { property: 'nama_instansi', isMoney: false, isDate: false },
      { property: 'nik_mo', isMoney: false, isDate: false },
      { property: 'nama_mo', isMoney: false, isDate: false },
      { property: 'outlet_2', isMoney: false, isDate: false },
      { property: 'outlet_3', isMoney: false, isDate: false },
      { property: 'nama_cabang_transaksi', isMoney: false, isDate: false },
      { property: 'kode_cabang_transaksi', isMoney: false, isDate: false },
      { property: 'outlet_4', isMoney: false, isDate: false },
      { property: 'kode_outlet', isMoney: false, isDate: false },
      { property: 'channel_syariah', isMoney: false, isDate: false },
      { property: 'channel', isMoney: false, isDate: false },
      { property: 'cif', isMoney: false, isDate: false },
      { property: 'nik_ktp_nasabah', isMoney: false, isDate: false },
      { property: 'nama_nasabah', isMoney: false, isDate: false },
      { property: 'nama_produk', isMoney: false, isDate: false },
      { property: 'no_kontrak', isMoney: false, isDate: false },
      { property: 'osl', isMoney: false, isDate: false },
      { property: 'saldo_tabemas', isMoney: false, isDate: false },
      { property: 'created_at_leads', isMoney: false, isDate: true },
      { property: 'approved_at_leads', isMoney: false, isDate: true },
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
          const tgl = common.tanggal(val[col.property]);
          data = tgl == 'Invalid Date' ? '—' : tgl;
        }

        if (col.isMoney) {
          data = common.rupiah(+val[col.property], false);
        }

        worksheet
          .cell(rows, ++bodyLineNum)
          .string(data && data != 'null' ? data : '-')
          .style(outlineStyle);
      }

      rows++;
    }

    const fileBuffer = await workbook.writeToBuffer();

    res.set({
      'Content-Disposition': `attachment; filename="REPORTOSL-${Date.now()}.xlsx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return res.end(fileBuffer);
  } catch (e) {
    next(e);
  }
};

export const getReportPromoSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = {
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 250,
      offset: null,
    };

    const paging = queryHelper.paging({ ...filter });
    filter.offset = paging.offset;
    filter.limit = paging.limit;

    const report = await promosiReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const dataRes = {
      meta: {
        count: report.count,
        rowCount: report.data.length,
        page: filter.page,
        limit: filter.limit,
        offset: filter.offset,
      },
      report: report.data,
    };
    return res.customSuccess(200, 'Get report promo', dataRes, {
      count: report.count,
      rowCount: report.data.length,
      limit: filter.limit,
      offset: filter.offset,
    });
  } catch (e) {
    return next(e);
  }
};

export const genExcelReportPromoSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = {
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
    };

    const report = await promosiReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const data = report.data;

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls('Report Penyerapan Promo');

    const col = 11;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 27);
    }

    worksheet.cell(1, 1, 1, 9, true).string('REPORT PENYERAPAN PROMO').style(headingStyle);
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
      'ID PROMOSI',
      'NAMA PROMOSI',
      'PRODUK',
      'JENIS PROMOSI',
      'TGL BERLAKU',
      'TGL BERAKHIR',
      'TOTAL ALOKASI',
      'NILAI PER TRANSAKSI',
      'NILAI PERSEN PER TRANSAKSI',
      'NILAI PENYERAPAN',
    ];

    for (const header of judulKolom) {
      worksheet
        .cell(barisHeading, ++noHeading)
        .string(header)
        .style(outlineHeadingStyle);
    }

    let rows = 6;

    const valueKolom = [
      { property: 'id', isDate: false, isMoney: false },
      { property: 'nama_promosi', isDate: false, isMoney: false },
      { property: 'nama_produk', isDate: false, isMoney: false },
      { property: 'jenis_promosi', isDate: false, isMoney: false },
      { property: 'start_date', isDate: true, isMoney: false },
      { property: 'end_date', isDate: true, isMoney: false },
      { property: 'total_promosi', isDate: false, isMoney: true },
      { property: 'nilai_per_transaksi', isDate: false, isMoney: true },
      { property: 'nilai_persen_per_transaksi', isDate: false, isMoney: true },
      { property: 'nilai_penyerapan', isDate: false, isMoney: true },
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
          .string(data && data != 'null' ? data : '-')
          .style(outlineStyle);
      }

      rows++;
    }

    const fileBuffer = await workbook.writeToBuffer();

    res.set({
      'Content-Disposition': `attachment; filename="REPORTPROMO-${Date.now()}.xlsx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return res.end(fileBuffer);
  } catch (e) {
    next(e);
  }
};

export const getReportPromoClosing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = {
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 250,
      offset: null,
    };

    const paging = queryHelper.paging({ ...filter });
    filter.offset = paging.offset;
    filter.limit = paging.limit;

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const report = await promosiClosingReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const dataRes = {
      meta: {
        count: report.count,
        rowCount: report.data.length,
        page: filter.page,
        limit: filter.limit,
        offset: filter.offset,
      },
      report: report.data,
    };
    return res.customSuccess(200, 'Get report promo', dataRes, {
      count: report.count,
      rowCount: report.data.length,
      limit: filter.limit,
      offset: filter.offset,
    });
  } catch (e) {
    return next(e);
  }
};

export const genExcelReportPromoClosing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = {
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const report = await promosiClosingReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const data = report.data;

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls('Report Promo Closing');

    const col = 11;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 27);
    }

    worksheet.cell(1, 1, 1, 9, true).string('REPORT PROMO CLOSING').style(headingStyle);
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
      'ID PROMOSI',
      'NAMA PROMOSI',
      'NASABAH',
      'CIF',
      'NAMA PRODUK',
      'NO KREDIT',
      'OUTLET TRANSAKSI',
      'TGL TRANSAKSI',
      'UANG PINJAMAN',
      'NILAI PROMOSI',
    ];

    for (const header of judulKolom) {
      worksheet
        .cell(barisHeading, ++noHeading)
        .string(header)
        .style(outlineHeadingStyle);
    }

    let rows = 6;

    const valueKolom = [
      { property: 'promo_id', isDate: false, isMoney: false },
      { property: 'nama_promosi', isDate: false, isMoney: false },
      { property: 'nama_nasabah', isDate: false, isMoney: false },
      { property: 'cif', isDate: false, isMoney: false },
      { property: 'nama_produk', isDate: false, isMoney: false },
      { property: 'no_kontrak', isDate: false, isMoney: false },
      { property: 'outlet_transaksi', isDate: false, isMoney: false },
      { property: 'tgl_kredit', isDate: true, isMoney: false },
      { property: 'uang_pinjaman', isDate: false, isMoney: true },
      { property: 'nilai_promosi', isDate: false, isMoney: true },
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
          .string(data && data != 'null' ? data : '-')
          .style(outlineStyle);
      }

      rows++;
    }

    const fileBuffer = await workbook.writeToBuffer();

    res.set({
      'Content-Disposition': `attachment; filename="REPORTPROMOCLOSING-${Date.now()}.xlsx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return res.end(fileBuffer);
  } catch (e) {
    next(e);
  }
};

export const getReportPromoClosingV2 = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = {
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 250,
      offset: null,
    };

    const paging = queryHelper.paging({ ...filter });
    filter.offset = paging.offset;
    filter.limit = paging.limit;

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const report = await promosiClosingReportV2(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const dataRes = {
      meta: {
        count: report.count,
        rowCount: report.data.length,
        page: filter.page,
        limit: filter.limit,
        offset: filter.offset,
      },
      report: report.data,
    };
    return res.customSuccess(200, 'Get report promo', dataRes, {
      count: report.count,
      rowCount: report.data.length,
      limit: filter.limit,
      offset: filter.offset,
    });
  } catch (e) {
    return next(e);
  }
};

export const genExcelReportPromoClosingV2 = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = {
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const report = await promosiClosingReportV2(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const data = report.data;

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls('Report Promo');

    const col = 11;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 27);
    }

    worksheet.cell(1, 1, 1, 9, true).string('REPORT PROMO').style(headingStyle);
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
      'ID PROMOSI',
      'NAMA PROMOSI',
      'NASABAH',
      'CIF',
      'NAMA PRODUK',
      'NO KREDIT',
      'OUTLET TRANSAKSI',
      'TGL TRANSAKSI',
      'UANG PINJAMAN',
      'NILAI PROMOSI',
    ];

    for (const header of judulKolom) {
      worksheet
        .cell(barisHeading, ++noHeading)
        .string(header)
        .style(outlineHeadingStyle);
    }

    let rows = 6;

    const valueKolom = [
      { property: 'promo_id', isDate: false, isMoney: false },
      { property: 'nama_promosi', isDate: false, isMoney: false },
      { property: 'nama_nasabah', isDate: false, isMoney: false },
      { property: 'cif', isDate: false, isMoney: false },
      { property: 'nama_produk', isDate: false, isMoney: false },
      { property: 'no_kontrak', isDate: false, isMoney: false },
      { property: 'outlet_transaksi', isDate: false, isMoney: false },
      { property: 'tgl_kredit', isDate: true, isMoney: false },
      { property: 'uang_pinjaman', isDate: false, isMoney: true },
      { property: 'nilai_promosi', isDate: false, isMoney: true },
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
          .string(data && data != 'null' ? data : '-')
          .style(outlineStyle);
      }

      rows++;
    }

    const fileBuffer = await workbook.writeToBuffer();

    res.set({
      'Content-Disposition': `attachment; filename="REPORTPROMOCLOSING-${Date.now()}.xlsx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return res.end(fileBuffer);
  } catch (e) {
    next(e);
  }
};
