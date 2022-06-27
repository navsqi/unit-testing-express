import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import Outlet from '~/orm/entities/Outlet';

export const getOutlet = async (req: Request, res: Response, next: NextFunction) => {
  const outletRepo = getRepository(Outlet);

  try {
    const [outlet, count] = await outletRepo.findAndCount();

    const dataRes = {
      meta: {
        count,
      },
      outlet,
    };

    return res.customSuccess(200, 'Get outlet', dataRes);
  } catch (e) {
    return next(e);
  }
};
