import { NextFunction, Request, Response } from 'express';
import User from '~/entities/User';
import userRepository from '~/repositories/userRepository';
import authService from '~/services/authService';
import { signToken } from '~/services/tokenService';
import CustomError from '~/utils/customError';

const userRepo = userRepository;

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodies = req.body;

    const user = await userRepo.findOne({
      where: { email: bodies.email },
    });

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

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as User;

    const createNewUser = await authService.register(body);

    if (createNewUser.error) {
      return next(new CustomError(createNewUser.msg, createNewUser.statusCode));
    }

    const token = await signToken(createNewUser.data);

    const dataRes = {
      user: createNewUser.data,
      bearer: token,
    };

    return res.customSuccess(200, 'Login success', dataRes);
  } catch (e) {
    return next(e);
  }
};
