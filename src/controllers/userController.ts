import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import User from '../orm/entities/User';

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRepository = getRepository(User);

    const [users, count] = await userRepository.findAndCount({ select: ['name', 'email', 'username', 'role'] });

    const dataRes = {
      count,
      users,
    };

    return res.customSuccess(200, 'Get users success', dataRes);
  } catch (e) {
    return next(e);
  }
};
