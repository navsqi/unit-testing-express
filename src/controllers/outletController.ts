import { NextFunction, Request, Response } from 'express';
import { ILike } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import Outlet from '~/orm/entities/Outlet';
import queryHelper from '~/utils/queryHelper';

const outletRepo = dataSource.getRepository(Outlet);

export const getOutlet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where = {};

    const filter = {
      nama: req.query.nama,
      parent: req.query.parent,
    };

    if (filter.nama) {
      where['nama'] = ILike(`%${filter.nama}%`);
    }

    if (filter.parent) {
      where['parent'] = +filter.parent;
    }

    const paging = queryHelper.paging(req.query);

    const [outlet, count] = await outletRepo.findAndCount({
      take: paging.limit,
      skip: paging.offset,
      where,
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
