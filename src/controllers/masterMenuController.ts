import { NextFunction, Request, Response } from 'express';
import { dataSource } from '~/orm/dbCreateConnection';
import MasterMenu from '~/orm/entities/MasterMenu';

const masterMenuRepo = dataSource.getRepository(MasterMenu);

export const getMasterMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const masterMenu = await masterMenuRepo.find();

    const dataRes = {
      masterMenu,
    };

    return res.customSuccess(200, 'Get master menu', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getMasterMenuById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const masterMenuById = await masterMenuRepo.findOne({
      where: { id: +req.params.id },
    });

    const dataRes = {
      masterMenu: masterMenuById,
    };

    return res.customSuccess(200, 'Get master menu', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const createNewMasterMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const masterMenu = await masterMenuRepo.save({
      ...req.body,
      kode_unit_kerja: req.user.kode_unit_kerja,
      created_by: req.user.nik,
      updated_by: req.user.nik,
    });

    const dataRes = {
      masterMenu,
    };

    return res.customSuccess(200, 'Create masterMenu success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const updateMasterMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const masterMenu = await masterMenuRepo.update(req.params.id, {
      ...req.body,
    });

    const dataRes = {
      masterMenu,
    };

    return res.customSuccess(200, 'Update master menu success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const deleteMasterMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const masterMenu = await masterMenuRepo.delete({ id: +req.params.id });

    const dataRes = {
      masterMenu,
    };

    return res.customSuccess(200, 'Delete master menu success', dataRes);
  } catch (e) {
    return next(e);
  }
};
