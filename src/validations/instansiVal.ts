import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import Leads from '~/orm/entities/Leads';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const masterInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema: Joi.ObjectSchema<Leads> = Joi.object().keys({
      nama_instansi: Joi.string().required(),
      cakupan_instansi: Joi.string().required(),
      alamat: Joi.string(),
      email: Joi.string().email(),
      no_telepon_instansi: Joi.string(),
      nama_karyawan: Joi.string(),
      no_telepon_karyawan: Joi.string(),
      email_karyawan: Joi.string().email(),
      jabatan_karyawan: Joi.string(),
    });

    const result = await schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (result.error) throw result.error.details;

    return next();
  } catch (e) {
    return next({ stack: e, name: 'PayloadValidationError' });
  }
};

export const approveInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema: Joi.ObjectSchema<Leads> = Joi.object().keys({
      is_approved: Joi.number().required(),
    });

    const result = await schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (result.error) throw result.error.details;

    return next();
  } catch (e) {
    return next({ stack: e, name: 'PayloadValidationError' });
  }
};

export const instansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema: Joi.ObjectSchema<Leads> = Joi.object().keys({
      master_instansi_id: Joi.number().required(),
      nama_instansi: Joi.string().required(),
      cakupan_instansi: Joi.string().required(),
      jenis_instansi: Joi.string(),
      alamat: Joi.string(),
      email: Joi.string().email(),
      no_telepon_instansi: Joi.string(),
      nama_karyawan: Joi.string(),
      no_telepon_karyawan: Joi.string(),
      email_karyawan: Joi.string().email(),
      jabatan_karyawan: Joi.string(),
      tanggal_berdiri_instansi: Joi.string(),
      jumlah_pegawai: Joi.number(),
      jumlah_pelanggan: Joi.number(),
      jumlah_kantor_cabang: Joi.number(),
      jumlah_kerjasama: Joi.number(),
      scoring_instansi: Joi.number(),
      status_potensial: Joi.string(),
      sarana_media_id: Joi.number(),
      organisasi_pegawai_id: Joi.number(),
    });

    const result = await schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (result.error) throw result.error.details;

    return next();
  } catch (e) {
    return next({ stack: e, name: 'PayloadValidationError' });
  }
};

const instansiVal = {
  masterInstansi,
  approveInstansi,
  instansi,
};

export default instansiVal;
