import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const loginVal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });

    const result = await schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (result.error) throw result.error.details;

    return next();
  } catch (e) {
    return next({ stack: e, name: 'PayloadValidationError' });
  }
};

export const registerVal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });

    const result = await schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (result.error) throw result.error.details;

    return next();
  } catch (e) {
    return next({ stack: e, name: 'PayloadValidationError' });
  }
};

const authVal = {
  loginVal,
  registerVal,
};

export default authVal;
