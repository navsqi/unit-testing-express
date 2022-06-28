import { getConnection } from 'typeorm';

export const konsolidasiTopBottom = async (outletId: number, isIdOnly = true) => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();
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
