import { getConnection } from 'typeorm';
import AssignmentInstansi from '~/orm/entities/AssignmentInstansi';
import { IPaging } from '~/utils/queryHelper';

const findOrCreate = async (instansiId: number, paging: IPaging) => {
  const connection = getConnection();

  const assignedUser = await connection
    .createQueryBuilder()
    .select(['ai.id', 'user.nik', 'user.role', 'user.nama', 'assignor.nik', 'assignor.role', 'assignor.nama'])
    .from(AssignmentInstansi, 'ai')
    .leftJoin('ai.user', 'user')
    .leftJoin('ai.assignor', 'assignor')
    .where('ai.instansi_id = :instansiId', { instansiId })
    .take(paging.limit)
    .skip(paging.offset)
    .getManyAndCount();

  return assignedUser;
};

const leadsSvc = {
  findOrCreate,
};

export default leadsSvc;
