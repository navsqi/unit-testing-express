import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import CustomError from './../utils/customError';
import { jwtPayload } from 'types/jwtPayload';
import { getRepository } from 'typeorm';
import User from '~/orm/entities/User';

export const isRoleMatch = (roles?: any[], role?: string): boolean => {
  if (roles && !roles.includes(role)) return false;

  return true;
};

export const protect = (roles?: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      const customError = new CustomError('Authorization header not provided', 400);
      return next(customError);
    }

    const token = authHeader.split(' ')[1];

    const userRepo = getRepository(User);

    try {
      const jwtPayload: jwtPayload = jwt.verify(token, process.env.JWT_SECRET_KEY as string);

      req.jwtPayload = jwtPayload;

      req.user = await userRepo.findOne({
        where: { id: jwtPayload.id },
        select: ['id', 'email', 'name', 'role', 'email'],
      });

      if (!isRoleMatch(roles, jwtPayload.role as string)) return next(new CustomError(`Access denied`, 403));

      next();
    } catch (e) {
      return next(e);
    }
  };
};

export default protect;
