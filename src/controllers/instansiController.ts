import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import MasterInstansi from '~/orm/entities/MasterInstansi';
import queryHelper from '~/utils/queryHelper';

export const getMasterInstansi = async (req: Request, res: Response, next: NextFunction) => {
  const masterInsRepository = getRepository(MasterInstansi);

  try {
    const paging = queryHelper.paging(req.query);

    const [masterInstansi, count] = await masterInsRepository.findAndCount({
      take: paging.limit,
      skip: paging.offset,
    });

    const dataRes = {
      meta: {
        count,
        limit: paging.limit,
        offset: paging.offset,
      },
      masterInstansi,
    };

    return res.customSuccess(200, 'Get master instansi', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const createNewInstansi = async (req: Request, res: Response, next: NextFunction) => {
  const masterInsRepository = getRepository(MasterInstansi);

  try {
    const instansi = await masterInsRepository.save({
      ...req.body,
      created_by: req.user.id,
      updated_by: req.user.id,
    });

    const dataRes = {
      instansi: instansi,
    };

    return res.customSuccess(200, 'Create instansi success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const updateMasterInstansi = async (req: Request, res: Response, next: NextFunction) => {
  const masterInsRepository = getRepository(MasterInstansi);

  try {
    const instansi = await masterInsRepository.update(req.params.id, {
      ...req.body,
      updated_by: req.user.id,
    });

    const dataRes = {
      instansi: instansi,
    };

    return res.customSuccess(200, 'Create instansi success', dataRes);
  } catch (e) {
    return next(e);
  }
};
