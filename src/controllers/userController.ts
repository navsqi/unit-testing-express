import { NextFunction, Request, Response } from 'express';
import { FindOptionsWhere, In } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import queryHelper from '~/utils/queryHelper';
import User from '../orm/entities/User';

const userRepo = dataSource.getRepository(User);

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where: FindOptionsWhere<User> = {};
    const filter = {
      kode_role: (req.query.kode_role as string) ?? null,
      kode_unit_kerja: (req.query.kode_unit_kerja as string) ?? null,
    };

    if (filter.kode_role) {
      where.kode_role = In(filter.kode_role.split(','));
    }

    if (filter.kode_unit_kerja) {
      where.kode_unit_kerja = In(filter.kode_unit_kerja.split(','));
    }

    const paging = queryHelper.paging(req.query);

    const [users, count] = await userRepo.findAndCount({
      take: paging.limit,
      skip: paging.offset,
      select: ['nik', 'nama', 'kode_role', 'kode_unit_kerja', 'role'],
      where,
    });

    const dataRes = {
      meta: {
        count,
        limit: paging.limit,
        offset: paging.offset,
      },
      users,
    };

    return res.customSuccess(200, 'Get users success', dataRes);
  } catch (e) {
    return next(e);
  }
};
