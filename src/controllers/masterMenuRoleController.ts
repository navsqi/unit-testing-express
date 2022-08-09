import { NextFunction, Request, Response } from 'express';
import { dataSource } from '~/orm/dbCreateConnection';
import AccessMenuRole from '~/orm/entities/AccessMenuRole';
import MasterMenu from '~/orm/entities/MasterMenu';
import menuRoleSrv from '~/services/menuRoleSrv';

const masterMenuRepo = dataSource.getRepository(MasterMenu);

export const getMasterMenuRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = {
      role_id: req.query.role_id ? +req.query.role_id : undefined,
      master_menu_id: req.query.master_menu_id ? req.query.master_menu_id : undefined,
    };

    const where: any = { access_menu_role: {} };

    if (filter.role_id) where.access_menu_role.role_id = +filter.role_id;
    if (filter.master_menu_id) where.access_menu_role.master_menu_id = +filter.master_menu_id;

    const masterMenu = await masterMenuRepo.find({
      where,
    });

    const dataRes = {
      masterMenu,
    };

    return res.customSuccess(200, 'Get master menu role', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const updateMasterMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const masterMenu = await menuRoleSrv.updateMenuRole(req.body as AccessMenuRole[]);

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
