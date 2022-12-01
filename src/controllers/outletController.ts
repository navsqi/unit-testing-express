import { NextFunction, Request, Response } from 'express';
import { ILike } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import Outlet from '~/orm/entities/Outlet';
import { konsolidasiTopBottomFullWithoutUpc } from '~/services/konsolidasiSvc';
import queryHelper from '~/utils/queryHelper';

const outletRepo = dataSource.getRepository(Outlet);

export const getOutlet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where = {};

    const filter = {
      nama: req.query.nama,
      parent: req.query.parent,
      kode: req.query.kode,
    };

    if (filter.nama) {
      where['nama'] = ILike(`%${filter.nama}%`);
    }

    if (filter.parent) {
      where['parent'] = filter.parent;
    }

    if (filter.kode) {
      where['kode'] = filter.kode;
    }

    const paging = queryHelper.paging(req.query);

    const [outlet, count] = await outletRepo.findAndCount({
      take: paging.limit,
      skip: paging.offset,
      where,
      order: {
        kode: 'asc',
        unit_kerja: 'asc',
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

    return res.customSuccess(200, 'Get outlet', dataRes, {
      count: count,
      rowCount: paging.limit,
      limit: paging.limit,
      offset: paging.offset,
      page: Number(req.query.page),
    });
  } catch (e) {
    return next(e);
  }
};

export const getOutletSessionWithChild = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isOneLevel = Number(req.query.is_one_level);
    let level = null;

    if (isOneLevel === 1) level = req.user.unit_kerja.unit_kerja;

    const outlet = await konsolidasiTopBottomFullWithoutUpc(
      req.user.kode_unit_kerja,
      {
        nama: (req.query.nama as string) || '',
        kode: (req.query.kode as string) || '',
      },
      level,
    );

    const dataRes = {
      meta: {
        count: outlet.length,
      },
      outlet,
    };

    return res.customSuccess(200, 'Get outlet', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getOutletById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outletById = await outletRepo.findOne({
      where: { id: +req.params.id },
    });

    const dataRes = {
      outlet: outletById,
    };

    return res.customSuccess(200, 'Get outlet', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const createNewOutlet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outlet = await outletRepo.save({
      ...req.body,
      created_by: req.user.nik,
      updated_by: req.user.nik,
    });

    const dataRes = {
      outlet: outlet,
    };

    return res.customSuccess(200, 'Create outlet success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const updateOutlet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outlet = await outletRepo.update(req.params.id, {
      ...req.body,
    });

    const dataRes = {
      outlet: outlet,
    };

    return res.customSuccess(200, 'Update outlet success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const deleteOutlet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outlet = await outletRepo.delete({ id: +req.params.id });

    const dataRes = {
      outlet: outlet,
    };

    return res.customSuccess(200, 'Delete outlet success', dataRes);
  } catch (e) {
    return next(e);
  }
};
