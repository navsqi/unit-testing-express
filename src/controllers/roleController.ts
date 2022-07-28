import { NextFunction, Request, Response } from 'express';
import { ILike } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import Instansi from '~/orm/entities/Instansi';
import MasterInstansi from '~/orm/entities/MasterInstansi';
import OrganisasiPegawai from '~/orm/entities/OrganisasiPegawai';
import SaranaMedia from '~/orm/entities/SaranaMedia';
import queryHelper from '~/utils/queryHelper';

const organisasiPegawaiRepo = dataSource.getRepository(OrganisasiPegawai);
const masterInsRepo = dataSource.getRepository(MasterInstansi);
const instansiRepo = dataSource.getRepository(Instansi);
const saranaMediaRepo = dataSource.getRepository(SaranaMedia);

export const getMasterInstansiById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const masterInstansiById = await masterInsRepo.findOne({
      where: { id: +req.params.id },
      relations: ['cakupan_instansi'],
    });

    const dataRes = {
      masterInstansi: masterInstansiById,
    };

    return res.customSuccess(200, 'Get master instansi', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const createNewMasterInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instansi = await masterInsRepo.save({
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

export const updateMasterInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instansi = await masterInsRepo.update(req.params.id, {
      ...req.body,
      updated_by: req.user.nik,
    });

    const dataRes = {
      instansi: instansi,
    };

    return res.customSuccess(200, 'Update instansi success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const deleteMasterInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instansi = await masterInsRepo.delete({ id: +req.params.id });

    const dataRes = {
      instansi: instansi,
    };

    return res.customSuccess(200, 'Delete instansi success', dataRes);
  } catch (e) {
    return next(e);
  }
};
