import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateAccessMenuVal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const access_menu_role = Joi.object()
      .keys({
        kode_role: Joi.string().required(),
        master_menu_id: Joi.string().required(),
      })
      .required();

    const schema = Joi.array().items(access_menu_role).required();

    const result = await schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (result.error) throw result.error.details;

    return next();
  } catch (e) {
    return next({ stack: e, name: 'PayloadValidationError' });
  }
};

const menuVal = {
  updateAccessMenuVal,
};

export default menuVal;
