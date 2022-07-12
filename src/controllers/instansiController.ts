import { NextFunction, Request, Response } from 'express';
import { FindManyOptions, getRepository, ILike } from 'typeorm';
import Instansi from '~/orm/entities/Instansi';
import MasterInstansi from '~/orm/entities/MasterInstansi';
import OrganisasiPegawai from '~/orm/entities/OrganisasiPegawai';
import SaranaMedia from '~/orm/entities/SaranaMedia';
import queryHelper from '~/utils/queryHelper';

export const getOrganisasiPegawai = async (req: Request, res: Response, next: NextFunction) => {
  const organisasiPegawaiRepo = getRepository(OrganisasiPegawai);

  try {
    const [organisasiPegawai, count] = await organisasiPegawaiRepo.findAndCount();

    const dataRes = {
      meta: {
        count,
      },
      organisasiPegawai,
    };

    return res.customSuccess(200, 'Get organisasi pegawai', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getSaranaMedia = async (req: Request, res: Response, next: NextFunction) => {
  const saranaMediaRepo = getRepository(SaranaMedia);

  try {
    const [saranaMedia, count] = await saranaMediaRepo.findAndCount();

    const dataRes = {
      meta: {
        count,
      },
      saranaMedia,
    };

    return res.customSuccess(200, 'Get sarana media', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getMasterInstansi = async (req: Request, res: Response, next: NextFunction) => {
  const masterInsRepo = getRepository(MasterInstansi);

  try {
    const filter = {
      nama_instansi: req.query.nama_instansi || '',
    };

    const paging = queryHelper.paging(req.query);

    const [masterInstansi, count] = await masterInsRepo.findAndCount({
      take: paging.limit,
      skip: paging.offset,
      where: {
        nama_instansi: ILike(`%${filter.nama_instansi}%`),
      },
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

export const getMasterInstansiById = async (req: Request, res: Response, next: NextFunction) => {
  const masterInsRepo = getRepository(MasterInstansi);

  try {
    const masterInstansiById = await masterInsRepo.findOne({
      where: { id: req.params.id },
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
  const masterInsRepo = getRepository(MasterInstansi);

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
  const masterInsRepo = getRepository(MasterInstansi);

  console.log(req.body);

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
  const masterInsRepo = getRepository(MasterInstansi);

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

export const getInstansi = async (req: Request, res: Response, next: NextFunction) => {
  const instansiRepo = getRepository(Instansi);

  try {
    const where: FindManyOptions<Instansi> = {};

    const filter = {
      nama_instansi: req.query.nama_instansi,
      is_approved: req.query.is_approved,
    };

    if (filter.nama_instansi) {
      where['nama_instansi'] = ILike(`%${filter.nama_instansi}%`);
    }

    if (filter.is_approved) {
      where['is_approved'] = +filter.is_approved;
    }

    const paging = queryHelper.paging(req.query);

    const [masterInstansi, count] = await instansiRepo.findAndCount({
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
      masterInstansi,
    };

    return res.customSuccess(200, 'Get instansi', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getInstansiById = async (req: Request, res: Response, next: NextFunction) => {
  const insRepo = getRepository(Instansi);

  try {
    const instansiById = await insRepo.findOne({
      where: { id: req.params.id },
      relations: ['master_instansi', 'cakupan_instansi', 'sarana_media', 'organisasi_pegawai'],
    });

    const dataRes = {
      instansi: instansiById,
    };

    return res.customSuccess(200, 'Get master instansi', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const createNewInstansi = async (req: Request, res: Response, next: NextFunction) => {
  const instansiRepo = getRepository(Instansi);

  try {
    console.log(req.body.kode_unit_kerja);
    const instansi = await instansiRepo.save({
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

export const updateInstansi = async (req: Request, res: Response, next: NextFunction) => {
  const instansiRepo = getRepository(Instansi);

  try {
    const instansi = await instansiRepo.update(req.params.id, {
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

export const deleteInstansi = async (req: Request, res: Response, next: NextFunction) => {
  const instansiRepo = getRepository(Instansi);

  try {
    const instansi = await instansiRepo.delete({ id: +req.params.id });

    const dataRes = {
      instansi: instansi,
    };

    return res.customSuccess(200, 'Delete instansi success', dataRes);
  } catch (e) {
    return next(e);
  }
};
