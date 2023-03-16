import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { jwtPayload } from '~/types/jwtPayload.types';
import User from '~/entities/User';
import CustomError from '~/utils/customError';
import { dataSource } from '~/config/infra/postgres';

const userRepo = dataSource.getRepository(User);

export const isRoleMatch = (roles?: any[], role?: string): boolean => {
  if (roles && !roles.includes(role)) return false;

  return true;
};

export const protect = (roles?: string[], isExclude = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      const customError = new CustomError('Authorization header not provided', 400);
      return next(customError);
    }

    const token = authHeader.split(' ')[1];

    try {
      const jwtPayload = jwt.verify(token, process.env.JWT_SECRET_KEY as string, {
        algorithms: ['HS512'],
      }) as jwtPayload;

      req.jwtPayload = jwtPayload;

      req.user = await userRepo.findOne({
        where: { id: jwtPayload.id },
        select: {
          id: true,
          email: true,
        },
      });

      if (isExclude && roles && roles.includes(req.user.role))
        return next(new CustomError(`Role ${req.user.role} is not permitted`, 403));

      if (!isRoleMatch(roles, req.user.role))
        return next(new CustomError(`Role ${req.user.role} is not permitted`, 403));

      next();
    } catch (e) {
      return next(e);
    }
  };
};

export default protect;
