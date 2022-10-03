import { NextFunction, Request, Response } from 'express';
import { dataSource } from '~/orm/dbCreateConnection';
import AccessMenuRole from '~/orm/entities/AccessMenuRole';
import MasterMenu from '~/orm/entities/MasterMenu';
import Role from '~/orm/entities/Role';
import menuRoleSvc from '~/services/menuRoleSvc';

const masterMenuRepo = dataSource.getRepository(MasterMenu);
const roleRepo = dataSource.getRepository(Role);

export const getMasterMenuRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = {
      kode_role: req.query.kode_role ? req.query.kode_role : undefined,
      master_menu_id: req.query.master_menu_id ? req.query.master_menu_id : undefined,
    };

    const where: any = { access_menu_role: {} };

    if (filter.kode_role) where.access_menu_role.kode_role = filter.kode_role;
    if (filter.master_menu_id) where.access_menu_role.master_menu_id = +filter.master_menu_id;

    const masterMenu = await masterMenuRepo.find({
      where,
    });

    const dataRes = {
      meta: {
        count: masterMenu.length,
      },
      masterMenu,
    };

    return res.customSuccess(200, 'Get master menu role', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getRoleMasterMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = {
      master_menu_id: req.query.master_menu_id ? req.query.master_menu_id : undefined,
    };

    const where: any = { access_menu_role: {} };

    if (filter.master_menu_id) where.access_menu_role.master_menu_id = +filter.master_menu_id;

    const role = await roleRepo.find({
      select: ['id', 'kode', 'nama'],
      where,
    });

    const dataRes = {
      meta: {
        count: role.length,
      },
      role,
    };

    return res.customSuccess(200, 'Get master menu role', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const updateMasterMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const masterMenu = await menuRoleSvc.updateMenuRole(req.body as AccessMenuRole[]);

    if (masterMenu.error && !masterMenu.success) {
      return next(masterMenu.error);
    }

    const dataRes = {
      masterMenu,
    };

    return res.customSuccess(200, 'Update master menu success', dataRes);
  } catch (e) {
    return next(e);
  }
};
