import { dataSource } from '~/orm/dbCreateConnection';
import AssignmentInstansi from '~/orm/entities/AssignmentInstansi';
import Instansi from '~/orm/entities/Instansi';
import { IPaging } from '~/utils/queryHelper';

export interface IFilterInstansi {
  nama_instansi?: string;
}

const listAssignUser = async (instansiId: number, paging: IPaging) => {
  const assignedUser = await dataSource
    .createQueryBuilder()
    .select(['ai.id', 'user.nik', 'user.role', 'user.nama', 'assignor.nik', 'assignor.role', 'assignor.nama'])
    .from(AssignmentInstansi, 'ai')
    .leftJoin('ai.user', 'user')
    .leftJoin('ai.assignor', 'assignor')
    .where('ai.instansi_id = :instansiId', { instansiId })
    .andWhere('user.is_active = 1')
    .take(paging.limit)
    .skip(paging.offset)
    .getManyAndCount();

  return assignedUser;
};

const listAssignInstansi = async (userNik: string, paging: IPaging, filter?: IFilterInstansi) => {
  const assignedUser = dataSource
    .createQueryBuilder()
    .select(['instansi', 'ai.user_nik', 'ai.assignor_nik'])
    .from(Instansi, 'instansi')
    .innerJoin('instansi.assignment_instansi', 'ai')
    .leftJoin('ai.assignor', 'assignor')
    .where('ai.user_nik = :userNik', { userNik });

  if (filter.nama_instansi) {
    assignedUser.andWhere('instansi.nama_instansi ~* :nama', { nama: filter.nama_instansi });
  }

  const res = await assignedUser.take(paging.limit).skip(paging.offset).getManyAndCount();

  return res;
};

const listBpoMo = async (nama: string, outlet?: string) => {
  const kodeUnitKerja = outlet
    ? `AND u.kode_unit_kerja IN (
    WITH RECURSIVE cte AS (
        SELECT
          kode,
          parent
        FROM
          outlet
        WHERE
          kode = '${outlet}'
      UNION
        SELECT
          o2.kode,
          o2.parent
        FROM
          outlet o2
        INNER JOIN cte s ON
          o2.parent = s.kode
              )
        SELECT
          kode
        FROM
          cte
  )`
    : '';
  try {
    const getBpoMo = await dataSource.query(
      `
      SELECT
        u.id AS user_id,
        u.nik AS nik,
        u.nama AS nama,
        u.kode_role AS kode_role,
        u.kode_unit_kerja AS kode_unit_kerja,
        aiu.user_nik
      FROM
        users u
      LEFT JOIN (SELECT user_nik FROM assignment_instansi ai INNER JOIN users u ON u.nik = ai.user_nik LIMIT 1) aiu ON aiu.user_nik = u.nik
      WHERE
        (u.kode_role IN ('MKTO', 'BPO1', 'BPO2') AND u.nama ~* $1 ${kodeUnitKerja}
          AND u.is_active = 1 AND aiu.user_nik IS NULL)
     `,
      [nama],
    );

    return { err: false, data: getBpoMo };
  } catch (error) {
    return { err: error, data: null };
  }
};

const assignmentInstansiSvc = {
  listAssignUser,
  listAssignInstansi,
  listBpoMo,
};

export default assignmentInstansiSvc;
