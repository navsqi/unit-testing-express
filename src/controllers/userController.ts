import { NextFunction, Request, Response } from 'express';
import userService from '~/services/userService';
import pagination from '~/utils/pagination';

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paging = pagination(req.query);

    const [users, count] = await userService.findAndCount();

    const dataRes = {
      users,
    };

    return res.customSuccess(200, 'Get users success', dataRes, {
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
