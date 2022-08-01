import { dataSource } from '~/orm/dbCreateConnection';
import AssignmentInstansi from '~/orm/entities/AssignmentInstansi';
import { IPaging } from '~/utils/queryHelper';

export const konsolidasiTopBottom = async (outletId: number, isIdOnly = true) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const konsolidasi: any[] = await manager.query(
      `with recursive cte as (
             select id,parent from outlet where id = $1
             union
             select o2.id, o2.parent from outlet o2
             inner join cte s on o2.parent = s.id
         )
         select id from cte
           `,
      [outletId],
    );

    await queryRunner.release();

    if (!isIdOnly) {
      return konsolidasi;
    }

    return konsolidasi.map((e) => e.id);
  } catch (error) {
    await queryRunner.release();
    return error;
  }
};

export const konsolidasiBottomTop = async (outletId: number, isIdOnly = true) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const konsolidasi: any[] = await manager.query(
      `with recursive cte as (
             select id,parent from outlet where id = $1
             union
             select o2.id, o2.parent from outlet o2
             inner join cte s on o2.id = s.parent
         )
         select id from cte
           `,
      [outletId],
    );

    await queryRunner.release();

    if (!isIdOnly) {
      return konsolidasi;
    }

    return konsolidasi.map((e) => e.id);
  } catch (error) {
    await queryRunner.release();
    return error;
  }
};
