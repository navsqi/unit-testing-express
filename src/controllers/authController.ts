import { NextFunction, Request, Response } from 'express';
import APISSO from '~/apis/sso';
import { objectUpload } from '~/config/minio';
import { ISSOExchangeTokenResponse } from '~/interfaces/ISso';
import { dataSource } from '~/orm/dbCreateConnection';
import { generateFileName } from '~/utils/common';
import ssoHelper from '~/utils/ssoHelper';
import User from '../orm/entities/User';
import { signToken } from '../services/tokenSvc';
import CustomError from '../utils/customError';

const userRepo = dataSource.getRepository(User);

export const register = async (req: Request, res: Response, next: NextFunction) => {
  let fileName: string = null;

  try {
    let photo: Express.Multer.File = null;
    const bodies = req.body as User;
    const user = new User();

    const checkExistingNik = await userRepo.findOne({ where: [{ email: bodies.email }, { nik: bodies.nik }] });

    if (checkExistingNik) {
      return next(new CustomError(`NIK / Email sudah ada`, 400));
    }

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
    user.password = bodies.password;
    user.photo = fileName;
    user.nik = bodies.nik;
    user.kode_role = bodies.kode_role;
    user.kode_unit_kerja = bodies.kode_unit_kerja;
    user.hashPassword();
    await userRepo.save(user);

    const token = await signToken(user);

    user.password = undefined;

    const dataRes = {
      user,
      bearer: token,
    };

    return res.customSuccess(200, 'New user created', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodies = req.body;

    const user = await userRepo.findOne({
      select: {
        role: {
          nama: true,
          kode: true,
        },
        unit_kerja: {
          nama: true,
          kode: true,
          unit_kerja: true,
        },
      },
      where: [{ email: bodies.email }, { nik: bodies.username }],
      relations: { role: true, unit_kerja: true },
    });

    if (!user) return next(new CustomError('User not found', 404));

    if (user.is_active === 0) return next(new CustomError('User inactive', 404));

    const isPassMatch = user.checkIfPasswordMatch(bodies.password);

    if (!isPassMatch) return next(new CustomError('Invalid password', 404));

    const token = await signToken(user);

    user.password = undefined;

    await userRepo.update(user.id, { last_login: new Date() });

    const dataRes = {
      user,
      bearer: token,
    };

    return res.customSuccess(200, 'Login success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const exchangeTokenSso = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodies = req.body;

    const loginSSO = await APISSO.exchangeTokenSso(bodies.code);

    if (loginSSO.status !== 200) return next(new CustomError(loginSSO.data.error_description, 400));

    const ssoRes = loginSSO.data as ISSOExchangeTokenResponse;

    let user = await userRepo.findOne({ where: { nik: ssoRes.nik } });

    const kodeRole = await ssoHelper.setRole(ssoRes.kode_jabatan);

    if (!kodeRole)
      return next(
        new CustomError(`Kode jabatan sso ${ssoRes.kode_jabatan} belum di-daftarkan pada service KAMILA`, 401),
      );

    const kodeOutlet = ssoHelper.setOutlet(ssoRes.kode_unit_kerja);

    // Jika user sso belum ada di DB Kamila, save to DB
    // Jika user sso ada di DB Kamila, update data DB
    if (!user) {
      user = await userRepo.save({
        nama: ssoRes.nama_lengkap,
        nik: ssoRes.nik,
        email: ssoRes.email,
        kode_role: kodeRole,
        kode_unit_kerja: kodeOutlet,
        photo: ssoRes.path_foto,
        last_login: new Date(),
        is_active: 1,
      });
    } else {
      await userRepo.update(user.id, {
        nama: ssoRes.nama_lengkap,
        nik: ssoRes.nik,
        email: ssoRes.email,
        kode_role: kodeRole,
        kode_unit_kerja: kodeOutlet,
        photo: ssoRes.path_foto,
        last_login: new Date(),
        is_active: 1,
      });

      user = await userRepo.findOne({ select: { password: false }, where: { nik: ssoRes.nik } });
    }

    const token = await signToken(user);
    const session = await userRepo.findOne({
      select: {
        password: false,
        role: {
          nama: true,
          kode: true,
        },
        unit_kerja: {
          nama: true,
          kode: true,
          unit_kerja: true,
        },
      },
      relations: { role: true, unit_kerja: true },
      where: { id: user.id },
    });

    session.password = undefined;

    const dataRes = {
      user: session,
      bearer: token,
    };

    return res.customSuccess(200, 'Login success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodies = req.body;

    const user = await userRepo.findOne({ where: { nik: req.params.nik } });

    if (!user) return next(new CustomError('User not found', 404));

    if (req.user.nik != req.params.nik && !(req.user.kode_role == 'SADM' || req.user.kode_role == 'ADMN'))
      return next(new CustomError('User is not allowed to change password', 404));

    user.password = bodies.newPass;

    user.hashPassword();

    await userRepo.update({ nik: req.user.nik }, user);

    const dataRes = {
      user,
    };

    return res.customSuccess(200, 'Login success', dataRes);
  } catch (e) {
    return next(e);
  }
};
