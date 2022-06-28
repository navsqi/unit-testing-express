import { NextFunction, Request, Response } from 'express';
import { getRepository, ILike } from 'typeorm';
import Outlet from '~/orm/entities/Outlet';
import queryHelper from '~/utils/queryHelper';

export const getOutlet = async (req: Request, res: Response, next: NextFunction) => {
  const outletRepo = getRepository(Outlet);

  try {
    const filter = {
      nama: req.query.nama || '',
    };

    const paging = queryHelper.paging(req.query);

    const [outlet, count] = await outletRepo.findAndCount({
      take: paging.limit,
      skip: paging.offset,
      where: {
        nama: ILike(`%${filter.nama}%`),
      },
    });

    const dataRes = {
      meta: {
        count,
        limit: paging.limit,
        offset: paging.offset,
      },
      outlet,
    };

    return res.customSuccess(200, 'Get outlet', dataRes);
  } catch (e) {
    return next(e);
  }
};
