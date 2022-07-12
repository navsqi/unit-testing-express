import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import Leads from '~/orm/entities/Leads';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const inputLeadsVal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema: Joi.ObjectSchema<Leads> = Joi.object().keys({
      nik_ktp: Joi.string().length(16),
      cif: Joi.string().length(16),
      event_id: Joi.number().required(),
      instansi_id: Joi.number().required(),
      nama: Joi.string().required().min(3).max(80),
      no_hp: Joi.string().required().min(10).max(15),
      kode_produk: Joi.string().required().max(10),
    });

    const result = await schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (result.error) throw result.error.details;

    return next();
  } catch (e) {
    console.log(e);
    return next({ stack: e, name: 'PayloadValidationError' });
  }
};

const leadsVal = {
  inputLeadsVal,
};

export default leadsVal;
