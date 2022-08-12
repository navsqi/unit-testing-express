import { NextFunction, Request, Response } from 'express';
import { FindOptionsWhere, In } from 'typeorm';
import { objectRemove, objectUpload } from '~/config/minio';
import { dataSource } from '~/orm/dbCreateConnection';
import { generateFileName } from '~/utils/common';
import CustomError from '~/utils/customError';
import queryHelper from '~/utils/queryHelper';
import User from '../orm/entities/User';

const userRepo = dataSource.getRepository(User);

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where: FindOptionsWhere<User> = {};
    const filter = {
      kode_role: (req.query.kode_role as string) ?? null,
      kode_unit_kerja: (req.query.kode_unit_kerja as string) ?? null,
    };

    if (filter.kode_role) {
      where.kode_role = In(filter.kode_role.split(','));
    }

    if (filter.kode_unit_kerja) {
      where.kode_unit_kerja = In(filter.kode_unit_kerja.split(','));
    }

    const paging = queryHelper.paging(req.query);

    const [users, count] = await userRepo.findAndCount({
      take: paging.limit,
      skip: paging.offset,
      select: ['nik', 'nama', 'kode_role', 'kode_unit_kerja'],
      where,
    });

    const dataRes = {
      meta: {
        count,
        limit: paging.limit,
        offset: paging.offset,
      },
      users,
    };

    return res.customSuccess(200, 'Get users success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const editUser = async (req: Request, res: Response, next: NextFunction) => {
  let fileName: string = null;

  try {
    let photo: Express.Multer.File = null;
    const bodies = req.body as User;
    const user = await userRepo.findOne({ where: { nik: req.params.nik } });

    if (!user) return next(new CustomError(`User tidak ditemukan`, 404));

    const userPhoto = user.photo ? user.photo.valueOf() : null;

    if (req.user.nik != user.nik) return next(new CustomError('User is not allowed to change password', 404));

    if (req.files && req.files['photo']) {
      photo = req.files['photo'][0];
      fileName = 'hbluserprofile/' + generateFileName(photo.originalname);

      await objectUpload(process.env.MINIO_BUCKET, fileName, photo.buffer, {
        'Content-Type': req.files['photo'][0].mimetype,
        'Content-Disposision': 'inline',
      });
    }

    user.nama = bodies.nama;
    user.email = bodies.email;
    user.photo = fileName;
    user.kode_role = bodies.kode_role;
    user.kode_unit_kerja = bodies.kode_unit_kerja;
    await userRepo.update({ nik: req.user.nik }, user);

    if (userPhoto) {
      await objectRemove(process.env.MINIO_BUCKET, userPhoto);
    }

    const dataRes = {
      user,
    };

    return res.customSuccess(200, 'New user created', dataRes);
  } catch (e) {
    return next(e);
  }
};
