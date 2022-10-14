import { NextFunction, Request, Response } from 'express';
import { objectRemove, objectUpload } from '~/config/minio';
import { dataSource } from '~/orm/dbCreateConnection';
import Instansi from '~/orm/entities/Instansi';
import Mou from '~/orm/entities/Mou';
import { konsolidasiTopBottom } from '~/services/konsolidasiSvc';
import { listMou } from '~/services/mouSvc';
import { generateFileName, tanggal } from '~/utils/common';
import CustomError from '~/utils/customError';
import queryHelper from '~/utils/queryHelper';
import xls from '~/utils/xls';
import * as common from '~/utils/common';

const mouRepo = dataSource.getRepository(Mou);
const instansiRepo = dataSource.getRepository(Instansi);

export const createMou = async (req: Request, res: Response, next: NextFunction) => {
  let fileName: string = null;

  try {
    let photo: Express.Multer.File = null;
    const bodies = req.body as Mou;
    const mou = new Mou();

    const getKodeUnitKerjaInstansi = await instansiRepo.findOne({ where: { id: bodies.instansi_id } });

    if (!getKodeUnitKerjaInstansi) return next(new CustomError('Instansi tidak ditemukan', 400));

    if (req.files && req.files['file']) {
      photo = req.files['file'][0];
      fileName = 'hblmou/' + generateFileName(photo.originalname);

      await objectUpload(process.env.MINIO_BUCKET, fileName, photo.buffer, {
        'Content-Type': req.files['file'][0].mimetype,
        'Content-Disposision': 'inline',
      });
    }

    mou.instansi_id = bodies.instansi_id;
    mou.jenis_kerjasama = bodies.jenis_kerjasama;
    mou.nomor_kerjasama = bodies.nomor_kerjasama;
    mou.nama_kerjasama = bodies.nama_kerjasama;
    mou.deskripsi = bodies.deskripsi;
    mou.start_date = bodies.start_date;
    mou.end_date = bodies.end_date;
    mou.nama_pic = bodies.nama_pic ? bodies.nama_pic : req.user.nama;
    mou.file = fileName;
    mou.created_by = req.user.nik;
    mou.kode_unit_kerja = getKodeUnitKerjaInstansi.kode_unit_kerja;

    await mouRepo.save(mou);

    const dataRes = {
      mou,
    };

    return res.customSuccess(200, 'New mou created', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getMou = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outletId = (req.query.kode_unit_kerja || req.user.kode_unit_kerja) as string;
    let outletIds = [];

    if (!outletId.startsWith('000')) {
      outletIds = await konsolidasiTopBottom(outletId as string);
    }

    const filter = {
      status: req.query.status || '',
      nomor_kerjasama: req.query.nomor_kerjasama || '',
      start_date: req.query.start_date || '',
      end_date: req.query.end_date || '',
      outlet_id: outletIds,
    };

    const paging = queryHelper.paging(req.query);

    const [mou, count] = await listMou(filter, paging);

    const dataRes = {
      meta: {
        count,
        limit: paging.limit,
        offset: paging.offset,
      },
      mou,
    };

    return res.customSuccess(200, 'Get mou', dataRes, {
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

export const genExcelMou = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = {
      status: req.query.status || '',
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
    };

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const dateDiff = common.getDiffDateCount(filter.start_date, filter.end_date);

    if (dateDiff > +process.env.DATERANGE_MOU)
      return next(new CustomError(`Maksimal ${process.env.DATERANGE_MOU} hari`, 400));

    const paging = common.pagingExcel();

    const [mou] = await listMou(filter, paging);

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls();

    const col = 15;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 25);
    }

    worksheet.cell(1, 1, 1, 9, true).string('LIST MOU').style(headingStyle);
    worksheet
      .cell(2, 1, 2, 9, true)
      .string(`TANGGAL ${tanggal(req.query.start_date as string)} S.D. ${tanggal(req.query.end_date as string)}`)
      .style(headingStyle);

    const barisHeading = 5;
    let noHeading = 0;

    const judulKolom = [
      'NO',
      'NAMA PIC',
      'JENIS KERJASAMA',
      'NOMOR KERJASAMA',
      'NAMA KERJASAMA',
      'INSTANSI',
      'STATUS',
      'DESKRIPSI',
      'TANGGAL DIMULAI',
      'TANGGAL BERAKHIR',
      'FILE KERJASAMA',
      'UNIT KERJA',
      'TANGGAL DIBUAT',
      'TANGGAL UPDATE',
    ];

    for (const header of judulKolom) {
      worksheet
        .cell(barisHeading, ++noHeading)
        .string(header)
        .style(outlineHeadingStyle);
    }

    let rows = 6;

    const valueKolom = [
      { property: 'nama_pic', isMoney: false, isDate: false },
      { property: 'jenis_kerjasama', isMoney: false, isDate: false },
      { property: 'nomor_kerjasama', isMoney: false, isDate: false },
      { property: 'nama_kerjasama', isMoney: false, isDate: false },
      { property: 'instansi.nama_instansi', isMoney: false, isDate: false },
      { property: 'status', isMoney: false, isDate: false },
      { property: 'deskripsi', isMoney: false, isDate: false },
      { property: 'start_date', isMoney: false, isDate: true },
      { property: 'end_date', isMoney: false, isDate: true },
      { property: 'file', isMoney: false, isDate: false, prefix: process.env.MINIO_LINK_PREFIX },
      { property: 'instansi.cakupan_instansi.nama', isMoney: false, isDate: false },
      { property: 'created_at', isMoney: false, isDate: true },
      { property: 'updated_at', isMoney: false, isDate: true },
    ];

    for (const [index, val] of mou.entries()) {
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

        if (data && data != 'null' && col?.prefix) {
          data = col.prefix + '/' + data;
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
      'Content-Disposition': `attachment; filename="MOU-${Date.now()}.xlsx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return res.end(fileBuffer);
  } catch (e) {
    next(e);
  }
};

export const getMouById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mou = await mouRepo.findOne({
      select: {
        user_created: {
          nama: true,
          nik: true,
        },
        outlet: {
          nama: true,
          kode: true,
          unit_kerja: true,
          parent: true,
        },
        instansi: {
          nama_instansi: true,
          jenis_instansi: true,
        },
      },
      relations: {
        outlet: true,
        instansi: true,
        user_created: true,
      },
      where: {
        id: +req.params.id,
      },
    });

    const dataRes = {
      mou,
    };

    return res.customSuccess(200, 'Get mou', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const updateMou = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodies = req.body as Mou;
    const mou = new Mou();

    mou.nama_pic = bodies.nama_pic;
    mou.status = bodies.status;
    mou.updated_by = req.user.nik;

    const updateMou = await mouRepo.update(req.params.id, mou);

    const dataRes = {
      mou: updateMou,
    };

    return res.customSuccess(200, 'Mou updated', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const deleteMou = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idMou = +req.params.id;

    const getCurrentMou = await mouRepo.findOne({ where: { id: idMou } });

    if (!getCurrentMou) return next(new CustomError('Data MoU tidak ditemukan', 404));

    const mou = await mouRepo.delete({ id: idMou });

    if (mou.affected > 0) {
      // delete mou
      await objectRemove(process.env.MINIO_BUCKET, getCurrentMou.file);
    }

    const dataRes = {
      mou: mou,
    };

    return res.customSuccess(200, 'Delete mou success', dataRes);
  } catch (e) {
    return next(e);
  }
};
