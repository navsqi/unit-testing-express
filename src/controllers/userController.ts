import { NextFunction, Request, Response } from 'express';
import { dataSource } from '~/orm/dbCreateConnection';
import User from '../orm/entities/User';

const userRepo = dataSource.getRepository(User);

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [users, count] = await userRepo.findAndCount({ select: ['nama', 'email', 'role'] });

    const dataRes = {
      count,
      users,
    };

    return res.customSuccess(200, 'Get users success', dataRes);
  } catch (e) {
    return next(e);
  }
};
