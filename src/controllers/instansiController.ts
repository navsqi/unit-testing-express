import dayjs from 'dayjs';
import { NextFunction, Request, Response } from 'express';
import { dataSource } from '~/orm/dbCreateConnection';
import Instansi, { JENIS_INSTANSI } from '~/orm/entities/Instansi';
import MasterInstansi from '~/orm/entities/MasterInstansi';
import OrganisasiPegawai from '~/orm/entities/OrganisasiPegawai';
import SaranaMedia from '~/orm/entities/SaranaMedia';
import { IFilterInstansi, listInstansi, listInstansiV2, listMasterInstansi } from '~/services/instansiSvc';
import { konsolidasiTopBottom } from '~/services/konsolidasiSvc';
import * as common from '~/utils/common';
import { tanggal } from '~/utils/common';
import CustomError from '~/utils/customError';
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
      jenis_instansi: req.query.jenis_instansi || '',
      is_deleted: false,
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

    return res.customSuccess(200, 'Get master instansi', dataRes, {
      count: count,
      rowCount: paging.limit,
      limit: paging.limit,
      offset: paging.offset,
      page: Number(req.query.page),
    });
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

    if (dateDiff > +process.env.DATERANGE_INSTANSI_EXCEL)
      return next(new CustomError(`Maksimal ${process.env.DATERANGE_INSTANSI_EXCEL} hari`, 400));

    const paging = common.pagingExcel();

    const [masterInstansi] = await listMasterInstansi(filter, paging);

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls();

    const col = 13;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 25);
    }

    worksheet.cell(1, 1, 1, 9, true).string('LIST MASTER INSTANSI').style(headingStyle);
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

    const valueKolom = [
      { property: 'jenis_instansi', isMoney: false, isDate: false },
      { property: 'nama_instansi', isMoney: false, isDate: false },
      { property: 'no_telepon_instansi', isMoney: false, isDate: false },
      { property: 'email', isMoney: false, isDate: false },
      { property: 'nama_karyawan', isMoney: false, isDate: false },
      { property: 'no_telepon_karyawan', isMoney: false, isDate: false },
      { property: 'email_karyawan', isMoney: false, isDate: false },
      { property: 'jabatan_karyawan', isMoney: false, isDate: false },
      { property: 'cakupan_instansi.nama', isMoney: false, isDate: false },
      { property: 'created_at', isMoney: false, isDate: true },
      { property: 'updated_at', isMoney: false, isDate: true },
      { property: 'created_by', isMoney: false, isDate: false },
    ];

    for (const [index, val] of masterInstansi.entries()) {
      let bodyLineNum = 1;
      worksheet
        .cell(rows, 1)
        .string(`${index + 1}`)
        .style(outlineStyle);

      for (const col of valueKolom) {
        let data = String(common.getDescendantProp(val, col.property));

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
    const instansi = await masterInsRepo.update(req.params.id, {
      ...req.body,
      is_deleted: true,
    });

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
    const outletId = (req.query.kode_unit_kerja || req.user.kode_unit_kerja) as string;

    const filter = {
      nama_instansi: req.query.nama_instansi || '',
      start_date: req.query.start_date || '',
      end_date: req.query.end_date || '',
      is_approved: req.query.is_approved ? +req.query.is_approved : '',
      kode_outlet: outletId,
      kategori_instansi: req.query.kategori_instansi || '',
      jenis_instansi: req.query.jenis_instansi || '',
      status_potensial: req.query.status_potensial || '',
      user_nik: req.user.nik,
      unit_assign: outletId,
      is_deleted: false,
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

    return res.customSuccess(200, 'Get instansi', dataRes, {
      count: count,
      rowCount: paging.limit,
      limit: paging.limit,
      offset: paging.offset,
      page: Number(req.query.page),
    });
  } catch (e) {
    return next(e);
  }
};

export const getInstansiV2 = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outletId = (req.query.kode_unit_kerja || req.user.kode_unit_kerja) as string;

    let filter: IFilterInstansi = {
      nama_instansi: (req.query.nama_instansi as string) || '',
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
      is_approved: req.query.is_approved ? +req.query.is_approved : null,
      kode_outlet: outletId,
      kategori_instansi: (req.query.kategori_instansi as string) || '',
      jenis_instansi: (req.query.jenis_instansi as string) || '',
      status_potensial: (req.query.status_potensial as string) || '',
      user_nik: req.user.nik,
      unit_assign: outletId,
      is_deleted: false,
      is_assign: Number(req.query.is_assign) as number,
      order_by: (req.query.order_by as string) ?? 'i.is_approved',
      order_type: (req.query.order_type as string) ?? 'ASC',
    };

    const paging = queryHelper.paging(req.query);

    if (req.query?.is_dropdown == '1') {
      filter = {
        is_dropdown: true,
        nama_instansi: (req.query.nama_instansi as string) || '',
        is_approved: 1,
        kode_outlet: outletId,
        user_nik: req.user.nik,
        unit_assign: outletId,
        is_deleted: false,
      };

      paging.limit = 400;
    }

    const [instansi, count] = await listInstansiV2(paging, filter);

    const dataRes = {
      meta: {
        count: count,
        limit: paging.limit,
        offset: paging.offset,
      },
      instansi,
    };

    return res.customSuccess(200, 'Get instansi', dataRes, {
      count: count as any,
      rowCount: paging.limit,
      limit: paging.limit,
      offset: paging.offset,
      page: Number(req.query.page),
    });
  } catch (e) {
    return next(e);
  }
};

export const genExcelInstansiV2 = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outletId = (req.query.kode_unit_kerja || req.user.kode_unit_kerja) as string;

    const filter: IFilterInstansi = {
      nama_instansi: (req.query.nama_instansi as string) || '',
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
      is_approved: req.query.is_approved ? +req.query.is_approved : null,
      kode_outlet: outletId,
      kategori_instansi: (req.query.kategori_instansi as string) || '',
      jenis_instansi: (req.query.jenis_instansi as string) || '',
      status_potensial: (req.query.status_potensial as string) || '',
      user_nik: req.user.nik,
      unit_assign: outletId,
      is_deleted: false,
      is_assign: Number(req.query.is_assign) as number,
      order_by: (req.query.order_by as string) ?? 'i.is_approved',
      order_type: (req.query.order_type as string) ?? 'ASC',
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > +process.env.DATERANGE_INSTANSI_EXCEL)
      return next(new CustomError(`Maksimal ${process.env.DATERANGE_INSTANSI_EXCEL} hari`, 400));

    const paging = common.pagingExcel();

    const [instansi, count] = await listInstansiV2(paging, filter);

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls('LIST INSTANSI KAMILA');

    const col = 20;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [13, 14, 15, 16];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 25);
    }

    worksheet.cell(1, 1, 1, 9, true).string('LIST INSTANSI').style(headingStyle);
    worksheet
      .cell(2, 1, 2, 9, true)
      .string(`TANGGAL ${tanggal(req.query.start_date as string)} S.D. ${tanggal(req.query.end_date as string)}`)
      .style(headingStyle);

    const judulKolom = [
      'NO',
      'STATUS POTENSIAL',
      'MASTER INSTANSI',
      'NAMA INSTANSI',
      'ALAMAT',
      'JUMLAH ASSIGNMENT',
      'TANGGAL INPUT',
      'STATUS',
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

    const valueKolom = [
      { property: 'status_potensial', isMoney: false, isDate: false },
      { property: 'nama_master_instansi', isMoney: false, isDate: false },
      { property: 'nama_instansi', isMoney: false, isDate: false },
      { property: 'alamat', isMoney: false, isDate: false },
      { property: 'count_assignment', isMoney: false, isDate: false },
      { property: 'created_at', isMoney: false, isDate: true },
      { property: 'status', isMoney: false, isDate: false },
    ];

    for (const [index, val] of (instansi as any[]).entries()) {
      let bodyLineNum = 1;
      worksheet
        .cell(rows, 1)
        .string(`${index + 1}`)
        .style(outlineStyle);

      for (const col of valueKolom) {
        let data = String(common.getDescendantProp(val, col.property));

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
      'Content-Disposition': `attachment; filename="INSTANSI-${Date.now()}.xlsx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return res.end(fileBuffer);
  } catch (e) {
    next(e);
  }
};

export const genExcelInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let outletIds = [];
    const outletId = (req.query.kode_unit_kerja || req.user.kode_unit_kerja) as string;

    if (!outletId.startsWith('000')) {
      outletIds = await konsolidasiTopBottom(outletId as string);
    }

    const filter = {
      is_approved: 1,
      outlet_id: outletIds,
      nama_instansi: req.query.nama_instansi || '',
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > +process.env.DATERANGE_INSTANSI_EXCEL)
      return next(new CustomError(`Maksimal ${process.env.DATERANGE_INSTANSI_EXCEL} hari`, 400));

    const paging = common.pagingExcel();

    const [instansi] = await listInstansi(filter, paging);

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls();

    const col = 20;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [13, 14, 15, 16];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 25);
    }

    worksheet.cell(1, 1, 1, 9, true).string('LIST INSTANSI').style(headingStyle);
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

    const valueKolom = [
      { property: 'jenis_instansi', isMoney: false, isDate: false },
      { property: 'nama_instansi', isMoney: false, isDate: false },
      { property: 'kategori_instansi', isMoney: false, isDate: false },
      { property: 'status_potensial', isMoney: false, isDate: false },
      { property: 'no_telepon_instansi', isMoney: false, isDate: false },
      { property: 'email', isMoney: false, isDate: false },
      { property: 'nama_karyawan', isMoney: false, isDate: false },
      { property: 'no_telepon_karyawan', isMoney: false, isDate: false },
      { property: 'email_karyawan', isMoney: false, isDate: false },
      { property: 'jabatan_karyawan', isMoney: false, isDate: false },
      { property: 'cakupan_instansi.nama', isMoney: false, isDate: false },
      { property: 'jumlah_pegawai', isMoney: false, isDate: false },
      { property: 'jumlah_pelanggan', isMoney: false, isDate: false },
      { property: 'jumlah_kantor_cabang', isMoney: false, isDate: false },
      { property: 'jumlah_kerjasama', isMoney: false, isDate: false },
      { property: 'sarana_media.deskripsi', isMoney: false, isDate: false },
      { property: 'organisasi_pegawai.deskripsi', isMoney: false, isDate: false },
      { property: 'created_at', isMoney: false, isDate: true },
      { property: 'updated_at', isMoney: false, isDate: true },
      { property: 'created_by', isMoney: false, isDate: false },
    ];

    for (const [index, val] of instansi.entries()) {
      let bodyLineNum = 1;
      worksheet
        .cell(rows, 1)
        .string(`${index + 1}`)
        .style(outlineStyle);

      for (const col of valueKolom) {
        let data = String(common.getDescendantProp(val, col.property));

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

    const yearKode = dayjs().format('YY');
    const masterInstansiKode = req.body.master_instansi_id.toString().padStart(5, '0');
    const jenisInstansiKode = JENIS_INSTANSI[req.body.jenis_instansi];
    const instansiPrefix = common.getKodePrefix();
    const kodeInstansi = `${yearKode}${jenisInstansiKode}${masterInstansiKode}${instansiPrefix}`;

    const instansi = await instansiRepo.save({
      ...req.body,
      kode_instansi: kodeInstansi,
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
    const instansi = await instansiRepo.update(req.params.id, {
      ...req.body,
      is_deleted: true,
    });

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
      approved_at: new Date(),
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
