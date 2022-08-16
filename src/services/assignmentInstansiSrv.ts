import { dataSource } from '~/orm/dbCreateConnection';
import AssignmentInstansi from '~/orm/entities/AssignmentInstansi';
import Instansi from '~/orm/entities/Instansi';
import { IPaging } from '~/utils/queryHelper';

const listAssignUser = async (instansiId: number, paging: IPaging) => {
  const assignedUser = await dataSource
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

const listAssignInstansi = async (userNik: string, paging: IPaging) => {
  const assignedUser = await dataSource
    .createQueryBuilder()
    .select(['instansi', 'ai.user_nik', 'ai.assignor_nik'])
    .from(Instansi, 'instansi')
    .innerJoin('instansi.assignment_instansi', 'ai')
    .leftJoin('ai.assignor', 'assignor')
    .where('ai.user_nik = :userNik', { userNik })
    .take(paging.limit)
    .skip(paging.offset)
    .getManyAndCount();

  return assignedUser;
};

const assignmentInstansiSrv = {
  listAssignUser,
  listAssignInstansi,
};

export default assignmentInstansiSrv;
