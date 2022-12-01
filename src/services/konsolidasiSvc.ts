import { dataSource } from '~/orm/dbCreateConnection';
import Outlet from '~/orm/entities/Outlet';

interface IFilter {
  nama?: string;
  kode?: string;
}

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

export const konsolidasiTopBottomFull = async (outletId: string, filter: IFilter): Promise<Outlet[]> => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const konsolidasi: any[] = await manager.query(
      `with recursive cte as (
             select kode,nama,parent from outlet where kode = $1
             union
             select o2.kode, o2.nama, o2.parent from outlet o2
             inner join cte s on o2.parent = s.kode
         )
         select * from cte where nama ~* $2 and kode ~* $3 order by kode asc
           `,
      [outletId, filter.nama, filter.kode],
    );

    await queryRunner.release();

    return konsolidasi;
  } catch (error) {
    await queryRunner.release();
    return error;
  }
};

export const konsolidasiTopBottomFullWithoutUpc = async (
  outletId: string,
  filter: IFilter,
  level?: string,
): Promise<Outlet[]> => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;
  let lvl = ``;

  if (level && Number(level) !== 4) lvl = ` and unit_kerja = '${Number(level) + 1}' `;

  try {
    const konsolidasi: any[] = await manager.query(
      `with recursive cte as (
             select kode,nama,parent,unit_kerja from outlet WHERE kode = $1 and (nama NOT ILIKE 'UPC%' OR nama NOT ILIKE 'UPS%')
             union
             select o2.kode, o2.nama, o2.parent, o2.unit_kerja from outlet o2
             inner join cte s on o2.parent = s.kode
             WHERE o2.nama NOT ILIKE 'UPC%' OR o2.nama NOT ILIKE 'UPS%'
         )
         select * from cte where nama ~* $2 and kode ~* $3 ${lvl} order by kode asc
           `,
      [outletId, filter.nama, filter.kode],
    );

    await queryRunner.release();

    return konsolidasi;
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

export const getRecursiveOutletQuery = (kodeOutlet: string) => {
  const query = `
                  WITH RECURSIVE cte AS (
                      SELECT 
                        kode, 
                        parent 
                      FROM 
                        outlet 
                      WHERE 
                        kode = '${kodeOutlet}' 
                      UNION 
                      SELECT 
                        o2.kode, 
                        o2.parent 
                      FROM 
                        outlet o2 
                        INNER JOIN cte s ON o2.parent = s.kode
                    ) 
                    SELECT 
                      kode 
                    FROM 
                      cte
                  `;

  return query;
};

export default {
  konsolidasiTopBottom,
  konsolidasiTopBottomFull,
  konsolidasiBottomTop,
  getOutletParent,
  getOutletChild,
  getRecursiveOutletQuery,
};
