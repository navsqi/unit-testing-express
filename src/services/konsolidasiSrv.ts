import { dataSource } from '~/orm/dbCreateConnection';

export const konsolidasiTopBottom = async (outletId: string, isIdOnly = true): Promise<string[]> => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const konsolidasi: any[] = await manager.query(
      `with recursive cte as (
             select kode,parent from outlet where kode = $1
             union
             select o2.kode, o2.parent from outlet o2
             inner join cte s on o2.parent = s.kode
         )
         select kode from cte
           `,
      [outletId],
    );

    await queryRunner.release();

    if (!isIdOnly) {
      return konsolidasi;
    }

    return konsolidasi.map((e) => e.kode);
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
            select kode,parent from outlet where kode = $1
            union
            select o2.kode, o2.parent from outlet o2
            inner join cte s on o2.kode = s.parent
        )
        select kode from cte
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

export const getOutletParent = async (outletId: number, isIdOnly = true) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const konsolidasi: any[] = await manager.query(
      `with recursive cte as (
            select kode,parent,nama,unit_kerja from outlet where kode = $1
            union
            select o2.kode, o2.parent,unit_kerja o2.nama from outlet o2
            inner join cte s on o2.kode = s.parent
        )
        select kode,nama,unit_kerja from cte where kode <> $1 and unit_kerja <> 1
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

export const getOutletChild = async (outletId: string, isIdOnly = true): Promise<string[]> => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const konsolidasi: any[] = await manager.query(
      `with recursive cte as (
             select kode,parent from outlet where kode = $1
             union
             select o2.kode, o2.parent from outlet o2
             inner join cte s on o2.parent = s.kode
         )
         select kode from cte where kode <> $1
           `,
      [outletId],
    );

    await queryRunner.release();

    if (!isIdOnly) {
      return konsolidasi;
    }

    return konsolidasi.map((e) => e.kode);
  } catch (error) {
    await queryRunner.release();
    return error;
  }
};
