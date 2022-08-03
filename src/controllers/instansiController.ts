import { NextFunction, Request, Response } from 'express';
import { dataSource } from '~/orm/dbCreateConnection';
import Instansi from '~/orm/entities/Instansi';
import MasterInstansi from '~/orm/entities/MasterInstansi';
import OrganisasiPegawai from '~/orm/entities/OrganisasiPegawai';
import SaranaMedia from '~/orm/entities/SaranaMedia';
import { listInstansi, listMasterInstansi } from '~/services/instansiSrv';
import { konsolidasiTopBottom } from '~/services/konsolidasiSrv';
import { tanggal } from '~/utils/common';
import queryHelper from '~/utils/queryHelper';
import xls from '~/utils/xls';

const organisasiPegawaiRepo = dataSource.getRepository(OrganisasiPegawai);
const masterInsRepo = dataSource.getRepository(MasterInstansi);
const instansiRepo = dataSource.getRepository(Instansi);
const saranaMediaRepo = dataSource.getRepository(SaranaMedia);

export const getOrganisasiPegawai = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [organisasiPegawai, count] = await organisasiPegawaiRepo.findAndCount();

    const dataRes = {
      meta: {
        count,
      },
      organisasiPegawai,
    };

    return res.customSuccess(200, 'Get organisasi pegawai', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getSaranaMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [saranaMedia, count] = await saranaMediaRepo.findAndCount();

    const dataRes = {
      meta: {
        count,
      },
      saranaMedia,
    };

    return res.customSuccess(200, 'Get sarana media', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getMasterInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = {
      nama_instansi: req.query.nama_instansi || '',
      start_date: req.query.start_date || '',
      end_date: req.query.end_date || '',
    };

    const paging = queryHelper.paging(req.query);

    const [masterInstansi, count] = await listMasterInstansi(filter, paging);

    const dataRes = {
      meta: {
        count,
        limit: paging.limit,
        offset: paging.offset,
      },
      masterInstansi,
    };

    return res.customSuccess(200, 'Get master instansi', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const genExcelMasterInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = {
      nama_instansi: req.query.nama_instansi || '',
      start_date: req.query.start_date || '',
      end_date: req.query.end_date || '',
    };

    const paging = queryHelper.paging(req.query);

    const [masterInstansi, count] = await listMasterInstansi(filter, paging);

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls();

    worksheet.column(1).setWidth(5);
    worksheet.column(2).setWidth(25);
    worksheet.column(3).setWidth(25);
    worksheet.column(4).setWidth(25);
    worksheet.column(5).setWidth(25);
    worksheet.column(6).setWidth(25);

    worksheet.cell(1, 1, 1, 9, true).string('DAFTAR NAMA MASTER INSTANSI').style(headingStyle);
    worksheet
      .cell(2, 1, 2, 9, true)
      .string(`TANGGAL ${tanggal(req.query.start_date as string)} S.D. ${tanggal(req.query.end_date as string)}`)
      .style(headingStyle);

    const barisHeading = 5;
    let noHeading = 0;
    worksheet
      .cell(barisHeading, ++noHeading)
      .string('NO')
      .style(outlineHeadingStyle);
    worksheet
      .cell(barisHeading, ++noHeading)
      .string('JENIS INSTANSI')
      .style(outlineHeadingStyle);
    worksheet
      .cell(barisHeading, ++noHeading)
      .string('NAMA INSTANSI')
      .style(outlineHeadingStyle);
    worksheet
      .cell(barisHeading, ++noHeading)
      .string('NO TELEPON')
      .style(outlineHeadingStyle);
    worksheet
      .cell(barisHeading, ++noHeading)
      .string('NAMA KARYAWAN')
      .style(outlineHeadingStyle);
    worksheet
      .cell(barisHeading, ++noHeading)
      .string('NO TELEPON KARYAWAN')
      .style(outlineHeadingStyle);

    let rows = 6;

    for (const [index, val] of masterInstansi.entries()) {
      let bodyLineNum = 1;
      worksheet
        .cell(rows, 1)
        .string(`${index + 1}`)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.jenis_instansi)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.nama_instansi)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.no_telepon_instansi)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.nama_karyawan)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.no_telepon_karyawan)
        .style(outlineStyle);

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

export const getMasterInstansiById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const masterInstansiById = await masterInsRepo.findOne({
      where: { id: +req.params.id },
      relations: ['cakupan_instansi'],
    });

    const dataRes = {
      masterInstansi: masterInstansiById,
    };

    return res.customSuccess(200, 'Get master instansi', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const createNewMasterInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body.nama_instansi = req.body.nama_instansi.toUpperCase();
    const kodeUnitKerja = req.body.kode_unit_kerja;
    req.body.kode_unit_kerja = kodeUnitKerja || req.user.kode_unit_kerja;
    const instansi = await masterInsRepo.save({
      ...req.body,
      kode_unit_kerja: req.user.kode_unit_kerja,
      created_by: req.user.nik,
      updated_by: req.user.nik,
    });

    const dataRes = {
      instansi: instansi,
    };

    return res.customSuccess(200, 'Create instansi success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const updateMasterInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instansi = await masterInsRepo.update(req.params.id, {
      ...req.body,
      updated_by: req.user.nik,
    });

    const dataRes = {
      instansi: instansi,
    };

    return res.customSuccess(200, 'Update instansi success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const deleteMasterInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instansi = await masterInsRepo.delete({ id: +req.params.id });

    const dataRes = {
      instansi: instansi,
    };

    return res.customSuccess(200, 'Delete instansi success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outletId = req.query.outlet_id || req.user.kode_unit_kerja;
    let outletIds = [];

    console.log(outletId);

    if (outletId != '00002') {
      outletIds = await konsolidasiTopBottom(outletId as string);
    }

    const filter = {
      nama_instansi: req.query.nama_instansi || '',
      start_date: req.query.start_date || '',
      end_date: req.query.end_date || '',
      is_approved: req.query.is_approved ? +req.query.is_approved : '',
      outlet_id: outletIds,
    };

    console.log(filter);

    const paging = queryHelper.paging(req.query);

    const [instansi, count] = await listInstansi(filter, paging);

    const dataRes = {
      meta: {
        count,
        limit: paging.limit,
        offset: paging.offset,
      },
      instansi,
    };

    return res.customSuccess(200, 'Get instansi', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const genExcelInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = {
      nama_instansi: req.query.nama_instansi || '',
      start_date: req.query.start_date || '',
      end_date: req.query.end_date || '',
    };

    const paging = queryHelper.paging(req.query);

    const [instansi, count] = await listInstansi(filter, paging);

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls();

    worksheet.column(1).setWidth(5);
    worksheet.column(2).setWidth(25);
    worksheet.column(3).setWidth(25);
    worksheet.column(4).setWidth(25);
    worksheet.column(5).setWidth(25);
    worksheet.column(6).setWidth(25);

    worksheet.cell(1, 1, 1, 9, true).string('DAFTAR NAMA INSTANSI').style(headingStyle);
    worksheet
      .cell(2, 1, 2, 9, true)
      .string(`TANGGAL ${tanggal(req.query.start_date as string)} S.D. ${tanggal(req.query.end_date as string)}`)
      .style(headingStyle);

    const barisHeading = 5;
    let noHeading = 0;
    worksheet
      .cell(barisHeading, ++noHeading)
      .string('NO')
      .style(outlineHeadingStyle);
    worksheet
      .cell(barisHeading, ++noHeading)
      .string('JENIS INSTANSI')
      .style(outlineHeadingStyle);
    worksheet
      .cell(barisHeading, ++noHeading)
      .string('NAMA PARENT INSTANSI')
      .style(outlineHeadingStyle);
    worksheet
      .cell(barisHeading, ++noHeading)
      .string('NAMA INSTANSI')
      .style(outlineHeadingStyle);
    worksheet
      .cell(barisHeading, ++noHeading)
      .string('ALAMAT')
      .style(outlineHeadingStyle);
    worksheet
      .cell(barisHeading, ++noHeading)
      .string('NO TELEPON')
      .style(outlineHeadingStyle);
    worksheet
      .cell(barisHeading, ++noHeading)
      .string('NAMA KARYAWAN')
      .style(outlineHeadingStyle);
    worksheet
      .cell(barisHeading, ++noHeading)
      .string('NO TELEPON KARYAWAN')
      .style(outlineHeadingStyle);

    let rows = 6;

    for (const [index, val] of instansi.entries()) {
      let bodyLineNum = 1;
      worksheet
        .cell(rows, 1)
        .string(`${index + 1}`)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.jenis_instansi)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.master_instansi.nama_instansi)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.nama_instansi)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.alamat)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.no_telepon_instansi)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.nama_karyawan)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.no_telepon_karyawan)
        .style(outlineStyle);

      rows++;
    }

    const fileBuffer = await workbook.writeToBuffer();

    res.set({
      'Content-Disposition': `attachment; filename="INSTANSI-${Date.now()}.xlsx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return res.end(fileBuffer);
  } catch (e) {
    next(e);
  }
};

export const getInstansiById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instansiById = await instansiRepo.findOne({
      where: { id: +req.params.id },
      relations: ['master_instansi', 'cakupan_instansi', 'sarana_media', 'organisasi_pegawai'],
    });

    const dataRes = {
      instansi: instansiById,
    };

    return res.customSuccess(200, 'Get master instansi', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const createNewInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body.nama_instansi = req.body.nama_instansi.toUpperCase();
    const instansi = await instansiRepo.save({
      ...req.body,
      kode_unit_kerja: req.user.kode_unit_kerja,
      created_by: req.user.nik,
      updated_by: req.user.nik,
    });

    const dataRes = {
      instansi: instansi,
    };

    return res.customSuccess(200, 'Create instansi success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const updateInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instansi = await instansiRepo.update(req.params.id, {
      ...req.body,
      updated_by: req.user.nik,
    });

    const dataRes = {
      instansi: instansi,
    };

    return res.customSuccess(200, 'Update instansi success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const deleteInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instansi = await instansiRepo.delete({ id: +req.params.id });

    const dataRes = {
      instansi: instansi,
    };

    return res.customSuccess(200, 'Delete instansi success', dataRes);
  } catch (e) {
    return next(e);
  }
};
