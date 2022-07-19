import { NextFunction, Request, Response } from 'express';
import { ILike } from 'typeorm';
import { objectUpload } from '~/config/minio';
import { dataSource } from '~/orm/dbCreateConnection';
import Mou from '~/orm/entities/Mou';
import { generateFileName } from '~/utils/common';
import queryHelper from '~/utils/queryHelper';

const mouRepo = dataSource.getRepository(Mou);

export const createMou = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let photo: Express.Multer.File = null;
    const bodies = req.body as Mou;
    const mou = new Mou();
    let fileName: string = null;

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
    mou.kode_unit_kerja = bodies.kode_unit_kerja ? bodies.kode_unit_kerja : req.user.kode_unit_kerja;

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
    const filter = {
      nama_kerjasama: req.query.nama_instansi || '',
    };

    const paging = queryHelper.paging(req.query);

    const [mou, count] = await mouRepo.findAndCount({
      take: paging.limit,
      skip: paging.offset,
      where: {
        nama_kerjasama: ILike(`%${filter.nama_kerjasama}%`),
      },
      order: {
        id: 'DESC',
      },
    });

    const dataRes = {
      meta: {
        count,
        limit: paging.limit,
        offset: paging.offset,
      },
      mou,
    };

    return res.customSuccess(200, 'Get mou', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getMouById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mou = await mouRepo.findOne({
      relations: ['outlet'],
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
    const mou = await mouRepo.delete({ id: +req.params.id });

    if (mou.affected > 0) {
      // delete photo
    }

    const dataRes = {
      mou: mou,
    };

    return res.customSuccess(200, 'Delete mou success', dataRes);
  } catch (e) {
    return next(e);
  }
};
