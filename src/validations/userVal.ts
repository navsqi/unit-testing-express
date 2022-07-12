import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const registerVal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = Joi.object().keys({
      email: Joi.string().email().messages({
        'string.base': `"email" should be a type of 'text'`,
        'string.empty': `"email" cannot be an empty field`,
        'string.min': `"email" should have a minimum length of {#limit}`,
        'string.email': `"email" invalid email`,
        'any.required': `"email" is a required field`,
      }),
    });

    const result = await schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (result.error) throw result.error.details;

    return next();
  } catch (e) {
    console.log(e);
    return next({ stack: e, name: 'PayloadValidationError' });
  }
};

const userVal = {
  registerVal,
};

export default userVal;
