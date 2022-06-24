import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import CustomError from '../utils/customError';
import User from '../orm/entities/User';
import { signToken } from './../services/tokenSrv';
import APISSO from '~/apis/sso';
import { ISSOExchangeTokenResponse } from '~/interfaces/ISso';
import { objectUpload } from '~/config/minio';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodies = req.body as User;
    const user = new User();
    const userRepository = getRepository(User);

    const uploadToS3 = await objectUpload(
      process.env.MINIO_BUCKET,
      req.files['photo'][0].originalname,
      req.files['photo'][0].buffer,
      { 'Content-Type': req.files['photo'][0].mimetype, 'Content-Disposision': 'inline' },
    );

    user.username = bodies.username;
    user.name = bodies.name;
    user.email = bodies.email;
    user.password = bodies.password;
    user.hashPassword();
    await userRepository.save(user);

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
  const userRepository = getRepository(User);

  try {
    const bodies = req.body as User;

    const user = await userRepository.findOne({ where: [{ email: bodies.email }, { username: bodies.username }] });

    if (!user) return next(new CustomError('User not found', 404));

    const isPassMatch = user.checkIfPasswordMatch(bodies.password);

    if (!isPassMatch) return next(new CustomError('Invalid password', 404));

    const token = await signToken(user);

    user.password = undefined;

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
  const userRepository = getRepository(User);

  try {
    const bodies = req.body;

    const loginSSO = await APISSO.exchangeTokenSso(bodies.code);

    if (loginSSO.status !== 200) throw new Error(loginSSO.data.toString());

    const ssoRes = loginSSO.data as ISSOExchangeTokenResponse;

    let user = await userRepository.findOne({ where: { nik: ssoRes.nik, name: ssoRes.nama_lengkap } });

    if (!user) {
      user = await userRepository.save({
        name: ssoRes.nama_lengkap,
        role: ssoRes.nama_jabatan,
        grade: ssoRes.nama_grade,
        nik: ssoRes.nik,
        username: ssoRes.nik,
        email: ssoRes.email,
        kode_unit_kerja: ssoRes.kode_unit_kerja,
      });
    }

    const token = await signToken(user);

    const dataRes = {
      user,
      bearer: token,
    };

    return res.customSuccess(200, 'Login success', dataRes);
  } catch (e) {
    return next(e);
  }
};
