import { FindManyOptions, FindOneOptions } from 'typeorm';
import User from '~/entities/User';
import userRepository from '~/repositories/userRepository';

export const findOne = async (options: FindOneOptions<User>) => {
  const data = await userRepository.findOne(options);

  return data;
};

export const findAndCount = async (options?: FindManyOptions<User>): Promise<[User[], number]> => {
  const [users, count] = await userRepository.findAndCount(options);

  return [users, count];
};

export default {
  findOne,
  findAndCount,
};
