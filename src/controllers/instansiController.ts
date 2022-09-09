import { NextFunction, Request, Response } from 'express';
import { dataSource } from '~/orm/dbCreateConnection';
import Instansi from '~/orm/entities/Instansi';
import MasterInstansi from '~/orm/entities/MasterInstansi';
import OrganisasiPegawai from '~/orm/entities/OrganisasiPegawai';
import SaranaMedia from '~/orm/entities/SaranaMedia';
import { listInstansi, listMasterInstansi } from '~/services/instansiSvc';
import { konsolidasiTopBottom } from '~/services/konsolidasiSvc';
import { tanggal } from '~/utils/common';
import CustomError from '~/utils/customError';
import queryHelper from '~/utils/queryHelper';
import xls from '~/utils/xls';
import * as common from '~/utils/common';

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
      jenis_instansi: req.query.jenis_instansi || '',
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
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > 90) return next(new CustomError('Maksimal 90 hari', 400));

    const paging = queryHelper.paging(req.query);

    const [masterInstansi, count] = await listMasterInstansi(filter, paging);

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
      .string(`TANGGAL ${tanggal(req.query.start_date as string)} S.D. ${tanggal(req.query.end_date as string)}`)
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
        .string(val.email)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.nama_karyawan)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.no_telepon_karyawan)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.email_karyawan)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.jabatan_karyawan)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.cakupan_instansi.nama)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(common.tanggal(val.created_at))
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(common.tanggal(val.updated_at))
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.created_by)
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
      relations: {
        cakupan_instansi: true,
      },
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
    const kodeUnitKerja = req.body.kode_unit_kerja || req.user.kode_unit_kerja;

    const instansi = await masterInsRepo.save({
      ...req.body,
      kode_unit_kerja: kodeUnitKerja,
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
    let outletIds = [];
    const outletId = (req.query.kode_unit_kerja || req.user.kode_unit_kerja) as string;

    if (!outletId.startsWith('000')) {
      outletIds = await konsolidasiTopBottom(outletId as string);
    }

    const filter = {
      nama_instansi: req.query.nama_instansi || '',
      start_date: req.query.start_date || '',
      end_date: req.query.end_date || '',
      is_approved: req.query.is_approved ? +req.query.is_approved : '',
      outlet_id: outletIds,
      kategori_instansi: req.query.kategori_instansi || '',
      jenis_instansi: req.query.jenis_instansi || '',
      status_potensial: req.query.status_potensial || '',
      user_nik: req.user.nik,
    };

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
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > 90) return next(new CustomError('Maksimal 90 hari', 400));

    const paging = queryHelper.paging(req.query);

    const [instansi, count] = await listInstansi(filter, paging);

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls();

    const col = 20;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [13, 14, 15, 16];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 25);
    }

    worksheet.cell(1, 1, 1, 9, true).string('DAFTAR NAMA INSTANSI').style(headingStyle);
    worksheet
      .cell(2, 1, 2, 9, true)
      .string(`TANGGAL ${tanggal(req.query.start_date as string)} S.D. ${tanggal(req.query.end_date as string)}`)
      .style(headingStyle);

    const judulKolom = [
      'NO',
      'JENIS INSTANSI',
      'NAMA INSTANSI',
      'KATEGORI INSTANSI',
      'STATUS POTENSIAL',
      'NO TELEPON',
      'EMAIL KANTOR',
      'NAMA KARYAWAN',
      'NO TELEPON KARYAWAN',
      'EMAIL KARYAWAN',
      'JABATAN KARYAWAN',
      'UNIT KERJA',
      'JUMLAH PEGAWAI',
      'JUMLAH PELANGGAN',
      'JUMLAH KANTOR CABANG',
      'JUMLAH KERJASAMA',
      'SARANA MEDIA',
      'KOPERASI/ORGANISASI',
      'TANGGAL DIBUAT',
      'TANGGAL UPDATE',
      'NIK PEMBUAT',
    ];

    const barisHeading = 5;
    let noHeading = 0;

    for (const header of judulKolom) {
      worksheet
        .cell(barisHeading, ++noHeading)
        .string(header)
        .style(outlineHeadingStyle);
    }

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
        .string(val.nama_instansi)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.kategori_instansi)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.status_potensial)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.no_telepon_instansi)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.email)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.nama_karyawan)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.no_telepon_karyawan)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.email_karyawan)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.jabatan_karyawan)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.cakupan_instansi.nama)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(String(val.jumlah_pegawai))
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(String(val.jumlah_pelanggan))
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(String(val.jumlah_kantor_cabang))
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(String(val.jumlah_kerjasama))
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.sarana_media.deskripsi)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.organisasi_pegawai.deskripsi)
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(common.tanggal(val.created_at))
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(common.tanggal(val.updated_at))
        .style(outlineStyle);
      worksheet
        .cell(rows, ++bodyLineNum)
        .string(val.created_by)
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
      select: {
        user_created: {
          nama: true,
          kode_role: true,
        },
      },
      where: { id: +req.params.id },
      relations: ['master_instansi', 'user_created', 'cakupan_instansi', 'sarana_media', 'organisasi_pegawai'],
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
    const kodeUnitKerja = req.body.kode_unit_kerja || req.user.kode_unit_kerja;

    const instansi = await instansiRepo.save({
      ...req.body,
      kategori_instansi: req.body.status_potensial === 'C' ? 'NON BINAAN' : 'BINAAN',
      kode_unit_kerja: kodeUnitKerja,
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

export const approveInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instansi = await instansiRepo.update(req.params.id, {
      is_approved: 1,
      updated_by: req.user.nik,
    });

    const dataRes = {
      instansi: instansi,
    };

    return res.customSuccess(200, 'Approve instansi success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const rejectInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const findCurrentInstansi = await instansiRepo.findOne({ where: { id: +req.params.id } });

    if (!findCurrentInstansi) return next(new CustomError(`Instansi tidak di-temukan`, 400));

    if (findCurrentInstansi && findCurrentInstansi.is_approved == 1)
      return next(new CustomError(`Instansi telah di-approve`, 400));

    const instansi = await instansiRepo.delete({ id: +req.params.id });

    const dataRes = {
      instansi: instansi,
    };

    return res.customSuccess(200, 'Reject instansi success', dataRes);
  } catch (e) {
    return next(e);
  }
};
