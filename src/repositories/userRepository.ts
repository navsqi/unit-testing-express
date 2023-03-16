import { DataSource } from 'typeorm';
import { dataSource } from '~/config/infra/postgres';
import User from '~/entities/User';

export const userRepository = dataSource.getRepository(User).extend({
  findByEmail(email: string) {
    const ds = this as DataSource;
    return ds.createQueryBuilder().select('u').from(User, 'u').where('u.email = :email', { email }).getOne();
  },
});

export default userRepository;
