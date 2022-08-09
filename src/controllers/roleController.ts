import { NextFunction, Request, Response } from 'express';
import { dataSource } from '~/orm/dbCreateConnection';
import Role from '~/orm/entities/Role';
import { listInstansi } from '~/services/instansiSrv';
import { konsolidasiTopBottom } from '~/services/konsolidasiSrv';
import queryHelper from '~/utils/queryHelper';

const roleRepo = dataSource.getRepository(Role);

export const getRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paging = queryHelper.paging(req.query);

    const [role, count] = await roleRepo.findAndCount({
      take: paging.limit,
      skip: paging.offset,
    });

    const dataRes = {
      meta: {
        count,
        limit: paging.limit,
        offset: paging.offset,
      },
      role,
    };

    return res.customSuccess(200, 'Get role', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getRoleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roleById = await roleRepo.findOne({
      where: { id: +req.params.id },
    });

    const dataRes = {
      role: roleById,
    };

    return res.customSuccess(200, 'Get master instansi', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const createNewRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instansi = await roleRepo.save({
      ...req.body,
      kode_unit_kerja: req.user.kode_unit_kerja,
      created_by: req.user.nik,
      updated_by: req.user.nik,
    });

    const dataRes = {
      instansi: instansi,
    };

    return res.customSuccess(200, 'Create instansi success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await roleRepo.update(req.params.id, {
      ...req.body,
    });

    const dataRes = {
      role: role,
    };

    return res.customSuccess(200, 'Update role success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = await roleRepo.delete({ id: +req.params.id });

    const dataRes = {
      role: role,
    };

    return res.customSuccess(200, 'Delete role success', dataRes);
  } catch (e) {
    return next(e);
  }
};
