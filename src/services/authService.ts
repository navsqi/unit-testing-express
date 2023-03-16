import { dataSource } from '~/config/infra/postgres';
import User from '~/entities/User';
import userRepository from '~/repositories/userRepository';
import GeneralServiceResponse from '~/types/generalServiceResponse.types';

interface IRegister {
  email: string;
  password: string;
}

export const register = async (payload: IRegister): Promise<GeneralServiceResponse<User>> => {
  const ctx = 'register';

  // create a new query runner
  const queryRunner = dataSource.createQueryRunner();

  // establish real database connection using our new query runner
  await queryRunner.connect();

  // we can also access entity manager that works with connection created by a query runner:
  const userRepo = await queryRunner.manager.withRepository(userRepository);

  // lets now open a new transaction:
  await queryRunner.startTransaction();

  try {
    const existingUser = await userRepo.findByEmail(payload.email);

    if (existingUser) {
      return { error: true, data: null, msg: 'Email already exist!', statusCode: 400 };
    }

    const dataUser = new User();
    dataUser.email = payload.email;
    dataUser.password = payload.password;
    dataUser.role = 'ADMIN';
    dataUser.hashPassword();

    const createUser = await userRepo.save(dataUser);

    // commit transaction now:
    await queryRunner.commitTransaction();

    return { error: false, data: createUser, msg: null, statusCode: 400 };
  } catch (e) {
    console.log(ctx, e);
    // since we have errors let's rollback changes we made
    await queryRunner.rollbackTransaction();

    return { error: true, data: e, msg: null, statusCode: 400 };
  } finally {
    // you need to release query runner which is manually created:
    await queryRunner.release();
  }
};

export default {
  register,
};
