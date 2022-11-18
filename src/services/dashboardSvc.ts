import { dataSource } from '~/orm/dbCreateConnection';

interface IFilter {
  outlet_id?: string[] | string;
  created_by?: any;
}

export const approvedInstansi = async (filter?: IFilter) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const q = manager.createQueryBuilder();
    q.from('instansi', 'i');
    q.select('count(*)', 'total');
    q.addSelect('i.is_approved', 'is_approved');

    q.addGroupBy('i.is_approved');
    q.orderBy('i.is_approved');

    if (filter.outlet_id && filter.outlet_id.length > 0) {
      q.andWhere('i.kode_unit_kerja IN (:...kodeUnitKerja)', { kodeUnitKerja: filter.outlet_id });
    }

    const data = await q.getRawMany();
    await queryRunner.commitTransaction();
    await queryRunner.release();

    const res = {
      not_yet_approved_instansi: String(0),
      approved_instansi: String(0),
    };

    for (const d of data) {
      if (d.is_approved == 1) res.approved_instansi = d.total;
      if (d.is_approved == 0) res.not_yet_approved_instansi = d.total;
    }

    return {
      err: false,
      data: res,
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
    return { err: error.message, data: null };
  }
};

export const approvedLeads = async (filter?: IFilter) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const q = manager.createQueryBuilder();
    q.from('leads', 'l');
    q.select('count(*)', 'total');
    q.addSelect('l.status', 'status');

    q.addGroupBy('l.status');
    q.orderBy('l.status');

    if (filter.outlet_id && filter.outlet_id.length > 0) {
      q.andWhere('l.kode_unit_kerja IN (:...kodeUnitKerja)', { kodeUnitKerja: filter.outlet_id });
    }

    const data = await q.getRawMany();
    await queryRunner.commitTransaction();
    await queryRunner.release();

    const res = {
      not_yet_approved_leads: String(0),
      approved_leads: String(0),
    };

    for (const d of data) {
      if (d.status == 1) res.approved_leads = d.total;
      if (d.status == 0) res.not_yet_approved_leads = d.total;
    }

    return {
      err: false,
      data: res,
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
    return { err: error.message, data: null };
  }
};

export const approvedMou = async (filter?: IFilter) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const diterima = manager.createQueryBuilder();
    diterima.from('mou', 'm');
    diterima.select('coalesce(count(*),0)', 'total');
    diterima.where(`status = 'DITERIMA'`);

    if (filter.outlet_id && filter.outlet_id.length > 0) {
      diterima.andWhere('kode_unit_kerja IN (:...kodeUnitKerja)', { kodeUnitKerja: filter.outlet_id });
    }

    const dataDiterima = await diterima.getRawOne();

    const pengajuan = manager.createQueryBuilder();
    pengajuan.from('mou', 'm');
    pengajuan.select('coalesce(count(*),0)', 'total');
    pengajuan.where(`status = 'PENGAJUAN'`);

    if (filter.outlet_id && filter.outlet_id.length > 0) {
      pengajuan.andWhere('kode_unit_kerja IN (:...kodeUnitKerja)', { kodeUnitKerja: filter.outlet_id });
    }

    const dataPengajuan = await pengajuan.getRawOne();

    await queryRunner.commitTransaction();
    await queryRunner.release();

    const res = {
      mou_pengajuan: dataPengajuan.total,
      mou_diterima: dataDiterima.total,
    };

    return {
      err: false,
      data: res,
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
    return { err: error.message, data: null };
  }
};

export const omsetPerKategoriProduk = async (filter?: IFilter) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const omset_pembiayaan = await manager.query(
      `
      SELECT
        COALESCE (SUM(lc.osl), 0) as total
      FROM
        leads_closing lc
      INNER JOIN leads l ON
        l.id = lc.leads_id
      WHERE
        lc.kode_unit_kerja IN (
      
      WITH RECURSIVE cte AS (
        SELECT
          kode,
          parent
        FROM
          outlet
        WHERE
          kode = '${filter.outlet_id}'
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
      ) AND l.kode_produk <> '62'
      `,
    );

    const omset_tabemas = await manager.query(
      `
      SELECT
        COALESCE (SUM(lc.osl), 0) as total
      FROM
        leads_closing lc
      INNER JOIN leads l ON
        l.id = lc.leads_id
      WHERE
        lc.kode_unit_kerja IN (
      
      WITH RECURSIVE cte AS (
        SELECT
          kode,
          parent
        FROM
          outlet
        WHERE
          kode = '${filter.outlet_id}'
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
      ) AND l.kode_produk = '62'
      `,
    );

    await queryRunner.commitTransaction();
    await queryRunner.release();

    return {
      err: false,
      data: {
        omset_pembiayaan: omset_pembiayaan[0].total,
        omset_tabemas: omset_tabemas[0].total,
      },
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
    return { err: error.message, data: null };
  }
};
