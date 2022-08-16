import { NextFunction, Request, Response } from 'express';
import { dataSource } from '~/orm/dbCreateConnection';
import AssignmentInstansi from '~/orm/entities/AssignmentInstansi';
import assignmentInstansiSrv, { IFilterInstansi } from '~/services/assignmentInstansiSrv';
import CustomError from '~/utils/customError';
import queryHelper from '~/utils/queryHelper';

const assignedInsRepo = dataSource.getRepository(AssignmentInstansi);

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

    const [assignUser, count] = await assignmentInstansiSrv.listAssignUser(+req.params.instansiId, paging);

    const dataRes = {
      meta: {
        ...paging,
        count,
      },
      assignUser,
    };

    return res.customSuccess(200, 'Assign user succesful', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getInstansiByAssignedUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paging = queryHelper.paging(req.query);
    const nikUser = req.params.userNik || req.user.nik;

    const filter: IFilterInstansi = {
      nama_instansi: (req.query.nama as string) || '',
    };

    const [assignUser, count] = await assignmentInstansiSrv.listAssignInstansi(nikUser, paging, filter);

    const dataRes = {
      meta: {
        ...paging,
        count,
      },
      assignUser,
    };

    return res.customSuccess(200, 'Assign user succesful', dataRes);
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
