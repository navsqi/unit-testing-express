import { NextFunction, Request, Response } from 'express';
import { FindOptionsWhere, In } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import AssignmentInstansi from '~/orm/entities/AssignmentInstansi';
import User from '~/orm/entities/User';
import assignmentInstansiSvc, { IFilterInstansi } from '~/services/assignmentInstansiSvc';
import CustomError from '~/utils/customError';
import queryHelper from '~/utils/queryHelper';

const assignedInsRepo = dataSource.getRepository(AssignmentInstansi);
// const userRepo = dataSource.getRepository(User);

export const assignUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;

    const findAssignment = await assignedInsRepo.find({
      where: { user_nik: req.body.user_nik, instansi_id: body.instansi_id },
    });

    if (findAssignment && findAssignment.length > 0) {
      return next(new CustomError('User sudah di-assign pada instansi yang dipilih', 400));
    }

    const assignUser = await assignedInsRepo.save({
      instansi_id: body.instansi_id,
      user_nik: body.user_nik,
      assignor_nik: req.user.nik,
      created_by: req.user.nik,
    });

    const dataRes = {
      assignUser,
    };

    return res.customSuccess(200, 'Assign user succesful', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getAssignedUserByInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paging = queryHelper.paging(req.query);

    const [assignUser, count] = await assignmentInstansiSvc.listAssignUser(+req.params.instansiId, paging);

    const dataRes = {
      meta: {
        ...paging,
        count,
      },
      assignUser,
    };

    return res.customSuccess(200, 'Assign user succesful', dataRes, {
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

export const getInstansiByAssignedUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paging = queryHelper.paging(req.query);
    const nikUser = req.params.userNik == '0' ? req.user.nik : req.params.userNik;

    const filter: IFilterInstansi = {
      nama_instansi: (req.query.nama_instansi as string) || '',
    };

    const [assignUser, count] = await assignmentInstansiSvc.listAssignInstansi(nikUser, paging, filter);

    const dataRes = {
      meta: {
        ...paging,
        count,
      },
      assignUser,
    };

    return res.customSuccess(200, 'Assign user succesful', dataRes, {
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

export const updateAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as AssignmentInstansi;

    const updateAssignment = await assignedInsRepo.update(req.params.id, {
      ...body,
    });

    const dataRes = {
      assignUser: updateAssignment,
    };

    return res.customSuccess(200, 'Assign user succesful', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const deleteAssignInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await assignedInsRepo.delete({ id: +req.params.id });

    const dataRes = {
      assignUser: assignment,
    };

    return res.customSuccess(200, 'Delete assignment instansi success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getUserBpoMo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = {
      kode_role: (req.query.kode_role as string) ?? null,
      kode_unit_kerja: (req.query.kode_unit_kerja as string) || req.user.kode_unit_kerja as string,
      nik_user: undefined,
      nama: (req.query.nama as string) ?? '',
      is_active: (+req.query.is_active as number) ?? null,
    };

    const where: FindOptionsWhere<User> = {};
    where.kode_role = In(['MKTO', 'BPO1', 'BPO2']);

    const bpoMo = await assignmentInstansiSvc.listBpoMo(filter.nama, filter.kode_unit_kerja);

    if (bpoMo.err) return next(new CustomError('Terjadi kesalahan saat mendapatkan BPO MO', 400));

    const dataRes = {
      meta: {
        count: bpoMo.data.length,
        limit: 0,
        offset: 0,
      },
      users: bpoMo.data,
    };

    return res.customSuccess(200, 'Get users success', dataRes);
  } catch (e) {
    return next(e);
  }
};
