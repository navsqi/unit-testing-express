import { SelectQueryBuilder } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import { QueryResultClosingReport } from '~/types/reportTypes';
import { getRecursiveOutletQuery } from './konsolidasiSvc';

interface IFilter {
  start_date: string;
  end_date: string;
  outlet_id?: string[];
  created_by?: any;
  is_mo?: boolean;
  page?: number;
  limit?: number;
  offset?: any;
  order_by?: any;
  order_type?: any;
  jenis_aktivitas?: string;
  instansi_id?: number;
  master_instansi_id?: number;
  jenis_instansi?: string;
}

export interface IFilterOSL {
  date?: string;
  outlet_id?: string[];
  created_by?: any;
  is_mo?: boolean;
  page?: number;
  limit?: number;
  offset?: any;
  order_by?: any;
  order_type?: any;
}

interface IFilterP2KI {
  no_pengajuan?: string;
  nama?: string;
  start_date?: string;
  end_date?: string;
  kode_produk?: string;
  instansi_id?: any;
  kode_status_pengajuan?: any;
  page?: number;
  limit?: number;
  offset?: any;
  kode_outlet?: string;
}

export const instansiReport = async (filter?: IFilter) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const q = manager.createQueryBuilder();
    q.from('instansi', 'i');
    q.select('i.created_at', 'created_at');
    q.addSelect('i.updated_at', 'updated_at');
    q.addSelect('u.nama', 'created_by');
    q.addSelect('i.created_by', 'nik_created_by');
    q.addSelect('user_update.nama', 'updated_by');
    q.addSelect('i.id', 'id_instansi');
    q.addSelect(`CONCAT(mi.id, ' - ', mi.nama_instansi)`, 'nama_master_instansi');
    q.addSelect(`CONCAT(i.id, ' - ', i.nama_instansi)`, 'nama_instansi');
    q.addSelect('i.alamat', 'alamat');
    q.addSelect('i.email', 'email');
    q.addSelect('i.no_telepon_instansi', 'no_telepon_instansi');
    q.addSelect('i.nama_karyawan', 'nama_karyawan');
    q.addSelect('i.no_telepon_karyawan', 'no_telepon_karyawan');
    q.addSelect('i.email_karyawan', 'email_karyawan');
    q.addSelect('i.jabatan_karyawan', 'jabatan_karyawan');
    q.addSelect('i.alamat', 'alamat');
    q.addSelect('i.master_instansi_id', 'master_instansi_id');
    q.addSelect('i.jenis_instansi', 'jenis_instansi');
    q.addSelect('i.kategori_instansi', 'kategori_instansi');
    q.addSelect('i.status_potensial', 'status_potensial');
    q.addSelect('coalesce(mou.jumlah_mou, 0)', 'jumlah_mou');
    q.addSelect('coalesce(pks.jumlah_pks, 0)', 'jumlah_pks');
    q.addSelect('coalesce(act.jumlah_aktivitas, 0)', 'jumlah_aktivitas');
    q.addSelect('coalesce(countleads.jumlah_leads, 0)', 'jumlah_leads');
    q.addSelect('i.kode_unit_kerja', 'kode_unit_kerja');
    q.addSelect('outlet.nama', 'nama_unit_kerja');
    q.addSelect('outlet.unit_kerja', 'unit');
    q.addSelect('outlet_p3.nama', 'nama_unit_kerja_parent_3');
    q.addSelect('outlet_p3.unit_kerja', 'unit_parent_3');
    q.addSelect('outlet_p2.nama', 'nama_unit_kerja_parent_2');
    q.addSelect('outlet_p2.unit_kerja', 'unit_parent_2');

    q.leftJoin('users', 'u', 'u.nik = i.created_by');
    q.leftJoin('users', 'user_update', 'user_update.nik = i.updated_by');

    q.addSelect('COALESCE(leads.omset, 0)', 'omset');
    q.addSelect('COALESCE(leads.osl, 0)', 'osl');
    q.addSelect('COALESCE(leads.saldo_tabemas, 0)', 'saldo_tabemas');

    q.innerJoin('master_instansi', 'mi', 'mi.id = i.master_instansi_id');
    q.leftJoin('outlet', 'outlet', 'outlet.kode = i.kode_unit_kerja');
    q.leftJoin('outlet', 'outlet_p3', 'outlet_p3.kode = outlet.parent');
    q.leftJoin('outlet', 'outlet_p2', 'outlet_p2.kode = outlet_p3.parent');

    q.leftJoin(
      (qb) => {
        const qb2 = qb as SelectQueryBuilder<any>;

        qb2
          .from('mou', 'm')
          .addSelect('instansi_id')
          .addSelect('count(*)', 'jumlah_mou')
          .where(`jenis_kerjasama = 'MOU'`)
          .groupBy('instansi_id');

        return qb2;
      },
      'mou',
      'mou.instansi_id = i.id',
    );

    q.leftJoin(
      (qb) => {
        const qb2 = qb as SelectQueryBuilder<any>;

        qb2
          .from('event', 'e')
          .addSelect('e.instansi_id', 'instansi_id')
          .addSelect('count(*)', 'jumlah_aktivitas')
          .groupBy('instansi_id');

        return qb2;
      },
      'act',
      'act.instansi_id = i.id',
    );

    q.leftJoin(
      (qb) => {
        const qb2 = qb as SelectQueryBuilder<any>;

        qb2
          .from('leads', 'l')
          .addSelect('l.instansi_id', 'instansi_id')
          .addSelect('count(*)', 'jumlah_leads')
          .groupBy('instansi_id');

        return qb2;
      },
      'countleads',
      'countleads.instansi_id = i.id',
    );

    q.leftJoin(
      (qb) => {
        const qb2 = qb as SelectQueryBuilder<any>;

        qb2
          .from('mou', 'm')
          .addSelect('instansi_id')
          .addSelect('count(*)', 'jumlah_pks')
          .where(`jenis_kerjasama = 'PKS'`)
          .groupBy('instansi_id');

        return qb2;
      },
      'pks',
      'pks.instansi_id = i.id',
    );

    q.leftJoin(
      (qb) => {
        const qb2 = qb as SelectQueryBuilder<any>;

        qb2
          .from('leads', 'l')
          .addSelect('l.instansi_id', 'instansi_id')
          .addSelect('sum(lcs.up)', 'omset')
          .addSelect('sum(leads_closing_omset_osl.osl)', 'osl')
          .addSelect('sum(leads_closing_omset_osl.saldo_tabemas)', 'saldo_tabemas')
          .innerJoin('leads_closing', 'lcs', 'lcs.leads_id = l.id')
          .leftJoin(
            (sq) => {
              const sq2 = sq as SelectQueryBuilder<any>;

              sq2
                .distinctOn(['lcs_osl.no_kontrak'])
                .from('leads_closing_osl', 'lcs_osl')
                .select('lcs_osl.leads_id', 'leads_id')
                .addSelect('lcs_osl.osl', 'osl')
                .addSelect('lcs_osl.saldo_tabemas', 'saldo_tabemas')
                .addSelect('lcs_osl.no_kontrak', 'no_kontrak')
                .orderBy('lcs_osl.no_kontrak')
                .addOrderBy('lcs_osl.tgl_kredit');

              return sq2;
            },
            'leads_closing_omset_osl',
            'leads_closing_omset_osl.leads_id = l.id',
          )
          .groupBy('l.instansi_id');

        return qb2;
      },
      'leads',
      'leads.instansi_id = i.id',
    );

    q.where('CAST(i.created_at AS date) >= :startDate', { startDate: filter.start_date });
    q.andWhere('CAST(i.created_at AS date) <= :endDate', { endDate: filter.end_date });
    q.andWhere('i.is_approved = 1');

    if (filter.outlet_id && filter.outlet_id.length > 0) {
      q.andWhere('i.kode_unit_kerja IN (:...kodeUnitKerja)', { kodeUnitKerja: filter.outlet_id });
    }

    if (filter.created_by) {
      q.andWhere('i.created_by = :userId', { userId: filter.created_by });
    }

    if (filter.jenis_instansi) {
      q.andWhere('i.jenis_instansi = :jenisInstansi', { jenisInstansi: filter.jenis_instansi });
    }

    if (filter.master_instansi_id) {
      q.andWhere('i.master_instansi_id = :masterInstansiId', { masterInstansiId: filter.master_instansi_id });
    }

    let count = null;

    if (filter.page && filter.limit && filter.offset !== null) {
      count = await q.getCount();

      q.limit(filter.limit);
      q.offset(filter.offset);
    }

    q.orderBy('i.created_at');
    const data = await q.getRawMany();
    await queryRunner.release();

    return {
      err: false,
      data,
      count: count ?? data.length,
    };
  } catch (error) {
    await queryRunner.release();
    return { err: error.message, data: null };
  }
};

export const eventReport = async (filter?: IFilter) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const q = manager.createQueryBuilder();
    q.from('event', 'e');
    q.select('e.created_at', 'created_at');
    q.addSelect('e.created_by', 'created_by_kode');
    q.addSelect('u.nama', 'created_by');
    q.addSelect('e.id', 'id_event');
    q.addSelect('e.instansi_id', 'instansi_id');
    q.addSelect('e.jenis_event', 'jenis_event');
    q.addSelect('i.nama_instansi', 'nama_instansi');
    q.addSelect('e.foto_dokumentasi', 'foto_dokumentasi');
    q.addSelect('e.keterangan', 'keterangan');
    q.addSelect('e.nama_pic', 'nama_pic');
    q.addSelect('e.nomor_hp_pic', 'nomor_hp_pic');
    q.addSelect('i.nama_karyawan', 'nama_karyawan');
    q.addSelect('e.nama_event', 'nama_event');
    q.addSelect('e.tanggal_event', 'tanggal_event');
    q.addSelect('i.nama_karyawan', 'nama_karyawan');
    q.addSelect('i.no_telepon_karyawan', 'no_telepon_karyawan');
    q.addSelect('mi.nama_instansi', 'nama_master_instansi');
    q.addSelect('outlet.nama', 'nama_unit_kerja');
    q.addSelect('outlet.unit_kerja', 'unit');
    q.addSelect('outlet_p3.nama', 'nama_unit_kerja_parent_3');
    q.addSelect('outlet_p3.unit_kerja', 'unit_parent_3');
    q.addSelect('outlet_p2.nama', 'nama_unit_kerja_parent_2');
    q.addSelect('outlet_p2.unit_kerja', 'unit_parent_2');
    q.addSelect('coalesce(countleads.jumlah_leads, 0)', 'jumlah_prospek');
    q.addSelect('coalesce(leads.omset, 0)', 'omset');
    q.addSelect('coalesce(leads.osl, 0)', 'osl');
    q.addSelect('coalesce(leads.saldo_tabemas, 0)', 'saldo_tabemas');

    q.leftJoin('instansi', 'i', 'i.id = e.instansi_id');
    q.leftJoin('master_instansi', 'mi', 'mi.id = i.master_instansi_id');
    q.leftJoin('outlet', 'outlet', 'outlet.kode = e.kode_unit_kerja');
    q.leftJoin('outlet', 'outlet_p3', 'outlet_p3.kode = outlet.parent');
    q.leftJoin('outlet', 'outlet_p2', 'outlet_p2.kode = outlet_p3.parent');
    q.innerJoin('users', 'u', 'u.nik = e.created_by');

    q.leftJoin(
      (qb) => {
        const qb2 = qb as SelectQueryBuilder<any>;

        qb2
          .from('leads', 'l')
          .addSelect('l.event_id', 'event_id')
          .addSelect('count(*)', 'jumlah_leads')
          .groupBy('event_id');

        return qb2;
      },
      'countleads',
      'countleads.event_id = e.id',
    );

    q.leftJoin(
      (qb) => {
        const qb2 = qb as SelectQueryBuilder<any>;

        qb2
          .from('leads', 'l')
          .addSelect('l.event_id', 'event_id')
          .addSelect('sum(lcs.up)', 'omset')
          .addSelect('sum(leads_closing_omset_osl.osl)', 'osl')
          .addSelect('sum(leads_closing_omset_osl.saldo_tabemas)', 'saldo_tabemas')
          .innerJoin('leads_closing', 'lcs', 'lcs.leads_id = l.id')
          .leftJoin(
            (sq) => {
              const sq2 = sq as SelectQueryBuilder<any>;

              sq2
                .distinctOn(['lcs_osl.no_kontrak'])
                .from('leads_closing_osl', 'lcs_osl')
                .select('lcs_osl.leads_id', 'leads_id')
                .addSelect('lcs_osl.osl', 'osl')
                .addSelect('lcs_osl.saldo_tabemas', 'saldo_tabemas')
                .addSelect('lcs_osl.no_kontrak', 'no_kontrak')
                .orderBy('lcs_osl.no_kontrak')
                .addOrderBy('lcs_osl.tgl_kredit');

              return sq2;
            },
            'leads_closing_omset_osl',
            'leads_closing_omset_osl.leads_id = l.id',
          )
          .groupBy('l.event_id');

        return qb2;
      },
      'leads',
      'leads.event_id = e.id',
    );

    // omset & OSL
    // q.leftJoin(
    //   (qb) => {
    //     const qb2 = qb as SelectQueryBuilder<any>;

    //     qb2
    //       .from('leads_closing', 'lcs')
    //       .addSelect('lcs.leads_id', 'leads_id')
    //       .addSelect('lcs.kode_produk', 'kode_produk')
    //       .addSelect('SUM(lcs.up)', 'omset')
    //       .groupBy('lcs.leads_id')
    //       .addGroupBy('lcs.kode_produk');

    //     return qb2;
    //   },
    //   'leadsclosing',
    //   'leadsclosing.leads_id = leads.id',
    // );

    // q.leftJoin(
    //   (qb) => {
    //     const qb2 = qb as SelectQueryBuilder<any>;

    //     qb2
    //       .from('leads_closing_osl', 'lcs')
    //       .addSelect('lcs.leads_id', 'leads_id')
    //       .addSelect('lcs.kode_produk', 'kode_produk')
    //       // .addSelect('SUM(lcs.up)', 'omset')
    //       .addSelect('SUM(lcs.osl)', 'osl')
    //       .addSelect('SUM(lcs.saldo_tabemas)', 'saldo_tabemas')
    //       .groupBy('lcs.leads_id')
    //       .addGroupBy('lcs.kode_produk');

    //     return qb2;
    //   },
    //   'leadsclosingosl',
    //   'leadsclosingosl.leads_id = leadsclosing.leads_id',
    // );
    // end of omset & OSL

    q.where('CAST(e.tanggal_event AS date) >= :startDate', { startDate: filter.start_date });
    q.andWhere('CAST(e.tanggal_event AS date) <= :endDate', { endDate: filter.end_date });

    if (filter.outlet_id && filter.outlet_id.length > 0) {
      q.andWhere('e.kode_unit_kerja IN (:...kodeUnitKerja)', { kodeUnitKerja: filter.outlet_id });
    }

    if (filter.created_by) {
      q.andWhere('e.created_by = :userId', { userId: filter.created_by });
    }

    if (filter.instansi_id) {
      q.andWhere('e.instansi_id = :instansiId', { instansiId: filter.instansi_id });
    }

    if (filter.jenis_aktivitas) {
      q.andWhere('e.jenis_event = :jenisAktivitas', { jenisAktivitas: filter.jenis_aktivitas });
    }

    let count = null;

    if (filter.page && filter.limit && filter.offset !== null) {
      count = await q.getCount();

      q.limit(filter.limit);
      q.offset(filter.offset);
    }

    q.orderBy('e.created_at');

    const data = await q.getRawMany();
    await queryRunner.release();

    return {
      err: false,
      data,
      count: count ?? data.length,
    };
  } catch (error) {
    console.log(error);
    await queryRunner.release();
    return { err: error.message, data: null };
  }
};

export const leadsReport = async (filter?: IFilter) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const q = manager.createQueryBuilder();
    q.from('leads', 'leads');
    q.select('leads.nik_ktp', 'nik_ktp_nasabah');
    q.addSelect('leads.cif', 'cif');
    q.addSelect('leads.nama', 'nama_nasabah');
    q.addSelect('leads.no_hp', 'no_hp_nasabah');
    q.addSelect('leads.is_karyawan', 'is_karyawan');
    q.addSelect('leads.is_ktp_valid', 'is_ktp_valid');
    q.addSelect('leads.instansi_id', 'instansi_id');
    q.addSelect('instansi.jenis_instansi', 'jenis_instansi');
    q.addSelect(`CONCAT(master_instansi.id, ' - ', master_instansi.nama_instansi)`, 'nama_master_instansi');
    q.addSelect(`CONCAT(instansi.id, ' - ', instansi.nama_instansi)`, 'nama_instansi');
    q.addSelect('instansi.kategori_instansi', 'kategori_instansi');
    q.addSelect('leads.event_id', 'event_id');
    q.addSelect('event.jenis_event', 'jenis_event');
    q.addSelect('event.nama_event', 'nama_event');
    q.addSelect('leads.created_by', 'created_by');
    q.addSelect('leads.created_at', 'created_at');
    q.addSelect('leads.step', 'step');
    q.addSelect('leads.is_ktp_valid', 'is_ktp_valid');
    q.addSelect('leads.flag_app', 'flag_app');
    q.addSelect('leads.kode_unit_kerja', 'kode_unit_kerja');
    q.addSelect('leads.approved_at', 'approved_at_leads');
    q.addSelect('leads.status', 'status_leads');
    q.addSelect('outlet.nama', 'nama_unit_kerja');
    q.addSelect('outlet.unit_kerja', 'unit');
    q.addSelect('outlet_p3.nama', 'nama_unit_kerja_parent_3');
    q.addSelect('outlet_p3.unit_kerja', 'unit_parent_3');
    q.addSelect('outlet_p2.nama', 'nama_unit_kerja_parent_2');
    q.addSelect('outlet_p2.unit_kerja', 'unit_parent_2');
    q.addSelect('leadsclosing.leads_id', 'leads_id');
    q.addSelect('leadsclosing.kode_produk', 'kode_produk');
    q.addSelect('produk.nama_produk', 'nama_produk');
    q.addSelect('leads.created_by', 'nik_created_by');
    q.addSelect('users.nama', 'nama_created_by');
    q.addSelect('COALESCE(leadsclosing.omset, 0)', 'omset');
    q.addSelect(
      'COALESCE((SELECT SUM(osl) from (SELECT distinct on(no_kontrak) no_kontrak, osl FROM leads_closing_osl lco WHERE lco.leads_id = leads.id AND lco.kode_produk = leadsclosing.kode_produk ORDER BY lco.no_kontrak, lco.tgl_kredit DESC) a), 0)',
      'osl',
    );
    q.addSelect(
      'COALESCE((SELECT SUM(saldo_tabemas) from (SELECT distinct on(no_kontrak) no_kontrak, saldo_tabemas FROM leads_closing_osl lco WHERE lco.leads_id = leads.id AND lco.kode_produk = leadsclosing.kode_produk ORDER BY lco.no_kontrak, lco.tgl_kredit DESC) a), 0)',
      'saldo_tabemas',
    );

    q.leftJoin('event', 'event', 'event.id = leads.event_id');
    q.leftJoin('instansi', 'instansi', 'instansi.id = leads.instansi_id');
    q.leftJoin('master_instansi', 'master_instansi', 'master_instansi.id = instansi.master_instansi_id');
    q.leftJoin('outlet', 'outlet_instansi', 'outlet_instansi.kode = instansi.kode_unit_kerja');
    q.leftJoin('outlet', 'outlet', 'outlet.kode = leads.kode_unit_kerja');
    q.leftJoin('outlet', 'outlet_p3', 'outlet_p3.kode = outlet.parent');
    q.leftJoin('outlet', 'outlet_p2', 'outlet_p2.kode = outlet_p3.parent');
    // q.leftJoin('leads_closing', 'lcs', 'lcs.leads_id = leads.id');

    q.leftJoin(
      (qb) => {
        const qb2 = qb as SelectQueryBuilder<any>;

        qb2
          .from('leads_closing', 'lcs')
          .addSelect('lcs.leads_id', 'leads_id')
          .addSelect('lcs.kode_produk', 'kode_produk')
          .addSelect('SUM(lcs.up)', 'omset')
          .groupBy('lcs.leads_id')
          .addGroupBy('lcs.kode_produk');

        return qb2;
      },
      'leadsclosing',
      'leadsclosing.leads_id = leads.id',
    );

    // q.leftJoin(
    //   (qb) => {
    //     const qb2 = qb as SelectQueryBuilder<any>;

    //     qb2
    //       .from('leads_closing_osl', 'lcs')
    //       .addSelect('lcs.leads_id', 'leads_id')
    //       .addSelect('lcs.kode_produk', 'kode_produk')
    //       .addSelect('lcs.tgl_kredit', 'tgl_kredit')
    //       .addSelect('SUM(lcs.osl)', 'osl')
    //       .addSelect('SUM(lcs.saldo_tabemas)', 'saldo_tabemas')
    //       .groupBy('lcs.leads_id')
    //       .addGroupBy('lcs.kode_produk')
    //       .addGroupBy('lcs.tgl_kredit');

    //     return qb2;
    //   },
    //   'leadsclosingosl',
    //   'leadsclosingosl.leads_id = leadsclosing.leads_id',
    // );

    q.leftJoin('produk', 'produk', 'produk.kode_produk = leadsclosing.kode_produk');
    q.leftJoin('users', 'users', 'users.nik = leads.created_by');

    q.where('CAST(leads.created_at AS date) >= :startDate', { startDate: filter.start_date });
    q.andWhere('CAST(leads.created_at AS date) <= :endDate', { endDate: filter.end_date });

    if (filter.outlet_id && filter.outlet_id.length > 0) {
      q.andWhere('leads.kode_unit_kerja IN (:...kodeUnitKerja)', { kodeUnitKerja: filter.outlet_id });
    }

    if (filter.created_by) {
      q.andWhere('leads.created_by = :userId', { userId: filter.created_by });
    }

    let count = null;

    if (filter.page && filter.limit && filter.offset !== null) {
      count = await q.getCount();

      q.limit(filter.limit);
      q.offset(filter.offset);
    }

    q.orderBy('leads.created_at');
    const data = await q.getRawMany();
    await queryRunner.release();

    return {
      err: false,
      data,
      count: count ?? data.length,
    };
  } catch (error) {
    await queryRunner.release();
    return { err: error.message, data: null };
  }
};

export const closingReport = async (filter?: IFilter) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const q = manager.createQueryBuilder();
    q.from('leads', 'leads');
    q.select('leads.nik_ktp', 'nik_ktp_nasabah');
    q.addSelect('lcs.tgl_kredit', 'tgl_kredit');
    q.addSelect('lcs.tgl_fpk', 'tgl_fpk');
    q.addSelect('leads.nama', 'nama_nasabah');
    q.addSelect('lcs.cif', 'cif');
    q.addSelect('leads.no_hp', 'no_hp_nasabah');
    q.addSelect('leads.is_karyawan', 'is_karyawan');
    q.addSelect('leads.kode_produk', 'kode_produk');
    q.addSelect('leads.instansi_id', 'instansi_id');
    q.addSelect(`CONCAT(master_instansi.id, ' - ', master_instansi.nama_instansi)`, 'nama_master_instansi');
    q.addSelect(`CONCAT(instansi.id, ' - ', instansi.nama_instansi)`, 'nama_instansi');
    q.addSelect('instansi.nama_instansi', 'nama_instansi');
    q.addSelect('outlet_instansi.nama', 'unit_kerja_instansi');
    q.addSelect('leads.event_id', 'event_id');
    q.addSelect('event.jenis_event', 'jenis_event');
    q.addSelect('event.nama_event', 'nama_event');
    q.addSelect('leads.created_by', 'created_by');
    q.addSelect('leads.created_at', 'created_at');
    q.addSelect('leads.step', 'step');
    q.addSelect('leads.is_ktp_valid', 'is_ktp_valid');
    q.addSelect('leads.flag_app', 'flag_app');
    q.addSelect('leads.kode_unit_kerja', 'kode_unit_kerja');
    q.addSelect('outlet.nama', 'nama_unit_kerja');
    q.addSelect('outlet.kode', 'kode_outlet');
    q.addSelect('outlet_cabang.nama', 'nama_cabang_transaksi');
    q.addSelect('outlet_cabang.kode', 'kode_cabang_transaksi');
    q.addSelect('outlet_leads.nama', 'outlet_leads');
    q.addSelect('outlet.unit_kerja', 'unit');
    q.addSelect('outlet_p3.nama', 'nama_unit_kerja_parent_3');
    q.addSelect('outlet_p3.unit_kerja', 'unit_parent_3');
    q.addSelect('outlet_p2.nama', 'nama_unit_kerja_parent_2');
    q.addSelect('outlet_p2.unit_kerja', 'unit_parent_2');
    q.addSelect('produk.nama_produk', 'nama_produk');
    q.addSelect('lcs.no_kontrak', 'no_kontrak');
    q.addSelect('lcs.channel', 'channel');
    q.addSelect('lcs.up', 'omset');
    q.addSelect('lcs.nik_mo', 'nik_mo');
    q.addSelect('lcs.nama_mo', 'nama_mo');
    q.addSelect('leads.created_at', 'created_at_leads');
    q.addSelect('leads.approved_at', 'approved_at_leads');
    q.addSelect('outlet_channel_syariah.nama', 'channel_syariah');
    // q.addSelect('coalesce(lcs.osl, 0)', 'osl_original');
    // q.addSelect('coalesce(lcs.saldo_tabemas, 0)', 'saldo_tabemas');
    // q.addSelect((subQuery) => {
    //   return subQuery
    //     .select('osl')
    //     .from('leads_closing', 'lc2')
    //     .where('lc2.no_kontrak = lcs.no_kontrak AND osl IS NOT NULL')
    //     .limit(1);
    // }, 'osl');
    // q.addSelect((subQuery) => {
    //   return subQuery
    //     .select('saldo_tabemas')
    //     .from('leads_closing', 'lc2')
    //     .where('lc2.no_kontrak = lcs.no_kontrak AND saldo_tabemas IS NOT NULL')
    //     .limit(1);
    // }, 'saldo_tabemas');

    q.leftJoin('event', 'event', 'event.id = leads.event_id');
    q.leftJoin('instansi', 'instansi', 'instansi.id = leads.instansi_id');
    q.leftJoin('master_instansi', 'master_instansi', 'master_instansi.id = instansi.master_instansi_id');
    q.leftJoin('outlet', 'outlet_instansi', 'outlet_instansi.kode = instansi.kode_unit_kerja');

    q.innerJoin('leads_closing', 'lcs', 'lcs.leads_id = leads.id');
    q.leftJoin('outlet', 'outlet_leads', 'outlet_leads.kode = leads.kode_unit_kerja');
    if (filter.is_mo) {
      q.leftJoin('outlet', 'outlet', 'outlet.kode = leads.kode_unit_kerja');
    } else {
      q.leftJoin('outlet', 'outlet', 'outlet.kode = lcs.kode_unit_kerja');
    }
    q.leftJoin('outlet', 'outlet_cabang', 'outlet_cabang.kode = lcs.kode_unit_kerja_pencairan');
    q.leftJoin('outlet', 'outlet_p3', 'outlet_p3.kode = outlet.parent');
    q.leftJoin('outlet', 'outlet_p2', 'outlet_p2.kode = outlet_p3.parent');
    q.leftJoin('outlet', 'outlet_channel_syariah', 'lcs.channeling_syariah = outlet_channel_syariah.kode');
    q.leftJoin('produk', 'produk', 'produk.kode_produk = lcs.kode_produk');

    q.where('CAST(lcs.tgl_kredit AS date) >= :startDate', { startDate: filter.start_date });
    q.andWhere('CAST(lcs.tgl_kredit AS date) <= :endDate', { endDate: filter.end_date });

    if (filter.outlet_id && filter.outlet_id.length > 0 && filter.is_mo) {
      q.andWhere(
        'leads.kode_unit_kerja IN (:...kodeUnitKerja) AND (lcs.kode_unit_kerja IN (:...lcsUnitKerja) OR  lcs.kode_unit_kerja_pencairan IN (:...lcsUnitKerja))',
        {
          kodeUnitKerja: filter.outlet_id,
          lcsUnitKerja: filter.outlet_id,
        },
      );
    } else if (filter.outlet_id && filter.outlet_id.length > 0 && !filter.is_mo) {
      q.andWhere(
        '(lcs.kode_unit_kerja IN (:...kodeUnitKerja) OR lcs.kode_unit_kerja_pencairan IN (:...kodeUnitKerja))',
        {
          kodeUnitKerja: filter.outlet_id,
        },
      );
    }

    let count = null;

    if (filter.page && filter.limit && filter.offset !== null) {
      count = 0;
      const queryAndParams = await q.getQueryAndParameters();

      const getCount = await manager.query(`SELECT COUNT(*) FROM (${queryAndParams[0]}) count_data`, queryAndParams[1]);
      count = Number(getCount[0].count);

      q.limit(filter.limit);
      q.offset(filter.offset);
    }

    let orderType: 'ASC' | 'DESC' = 'ASC';
    if (filter.order_by) {
      // produk.nama_produk
      // leads.kode_unit_kerja
      // lcs.no_kontrak
      // outlet_cabang.nama
      // instansi.nama_instansi
      orderType = filter.order_type ?? 'ASC';
      q.orderBy(filter.order_by, orderType);
    } else {
      q.orderBy('lcs.tgl_kredit');
    }

    const data: QueryResultClosingReport[] = await q.getRawMany();
    await queryRunner.release();

    return {
      err: false,
      data,
      count: count ?? data.length,
    };
  } catch (error) {
    await queryRunner.release();
    return { err: error.message, data: null };
  }
};

export const OSLReport = async (filter?: IFilterOSL) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const q = manager.createQueryBuilder();
    q.from('leads', 'leads');
    q.select('leads.nik_ktp', 'nik_ktp_nasabah');
    q.addSelect('lcs.tgl_kredit', 'tgl_kredit');
    q.addSelect('lcs.tgl_fpk', 'tgl_fpk');
    q.addSelect('leads.nama', 'nama_nasabah');
    q.addSelect('lcs.cif', 'cif');
    q.addSelect('leads.no_hp', 'no_hp_nasabah');
    q.addSelect('leads.is_karyawan', 'is_karyawan');
    q.addSelect('leads.kode_produk', 'kode_produk');
    q.addSelect('leads.instansi_id', 'instansi_id');
    q.addSelect('instansi.jenis_instansi', 'jenis_instansi');
    q.addSelect(`CONCAT(master_instansi.id, ' - ', master_instansi.nama_instansi)`, 'nama_master_instansi');
    q.addSelect(`CONCAT(instansi.id, ' - ', instansi.nama_instansi)`, 'nama_instansi');
    q.addSelect('outlet_instansi.nama', 'unit_kerja_instansi');
    q.addSelect('leads.event_id', 'event_id');
    q.addSelect('event.jenis_event', 'jenis_event');
    q.addSelect('event.nama_event', 'nama_event');
    q.addSelect('leads.created_by', 'created_by');
    q.addSelect('leads.created_at', 'created_at');
    q.addSelect('leads.step', 'step');
    q.addSelect('leads.is_ktp_valid', 'is_ktp_valid');
    q.addSelect('leads.flag_app', 'flag_app');
    q.addSelect('leads.kode_unit_kerja', 'kode_unit_kerja');
    q.addSelect('outlet.nama', 'nama_unit_kerja');
    q.addSelect('outlet.kode', 'kode_outlet');
    q.addSelect('outlet_cabang.nama', 'nama_cabang_transaksi');
    q.addSelect('outlet_cabang.kode', 'kode_cabang_transaksi');
    q.addSelect('outlet_leads.nama', 'outlet_leads');
    q.addSelect('outlet.unit_kerja', 'unit');
    q.addSelect('outlet_p3.nama', 'nama_unit_kerja_parent_3');
    q.addSelect('outlet_p3.unit_kerja', 'unit_parent_3');
    q.addSelect('outlet_p2.nama', 'nama_unit_kerja_parent_2');
    q.addSelect('outlet_p2.unit_kerja', 'unit_parent_2');
    q.addSelect('produk.nama_produk', 'nama_produk');
    q.addSelect('lcs.no_kontrak', 'no_kontrak');
    q.addSelect('lcs.channel', 'channel');
    // q.addSelect('lcs.up', 'omset');
    // q.addSelect((qb) => {
    //   qb.from('leads_closing_osl', 'lcso').select('lcso.osl', 'osl').where('lcs.no_kontrak = lcso.no_kontrak').limit(1);

    //   return qb;
    // }, 'osl');
    q.addSelect('lcs.osl', 'osl');
    q.addSelect('lcs.saldo_tabemas', 'saldo_tabemas');
    q.addSelect('lcs.nik_mo', 'nik_mo');
    q.addSelect('lcs.nama_mo', 'nama_mo');
    q.addSelect('leads.created_at', 'created_at_leads');
    q.addSelect('leads.approved_at', 'approved_at_leads');
    q.addSelect('outlet_channel_syariah.nama', 'channel_syariah');

    q.leftJoin('event', 'event', 'event.id = leads.event_id');
    q.leftJoin('instansi', 'instansi', 'instansi.id = leads.instansi_id');
    q.leftJoin('master_instansi', 'master_instansi', 'master_instansi.id = instansi.master_instansi_id');
    q.leftJoin('outlet', 'outlet_instansi', 'outlet_instansi.kode = instansi.kode_unit_kerja');

    q.innerJoin('leads_closing_osl', 'lcs', 'lcs.leads_id = leads.id');

    // q.leftJoin(
    //   (qb) => {
    //     const qb2 = qb as SelectQueryBuilder<any>;

    //     qb2
    //       .from('leads_closing_osl', 'lcso')
    //       .addSelect('lcso.no_kontrak', 'no_kontrak')
    //       .addSelect('lcso.osl', 'osl')
    //       // .where('lcso.no_kontrak = lcs.no_kontrak')
    //       .groupBy('lcso.no_kontrak')
    //       .addGroupBy('lcso.osl');

    //     return qb2;
    //   },
    //   'leadsclosingosl',
    //   'lcs.tgl_kredit <= :date and lcs.no_kontrak = lcs.no_kontrak',
    //   { date: filter.date },
    // );

    // q.leftJoin(
    //   (qb) => {
    //     const qb2 = qb as SelectQueryBuilder<any>;

    //     qb2
    //       .from('leads_closing_osl', 'lcs')
    //       .addSelect('lcs.leads_id', 'leads_id')
    //       .addSelect('lcs.saldo_tabemas', 'saldo_tabemas')
    //       .where('lcs.tgl_kredit <= :date', { date: filter.date })
    //       .orderBy('lcs.tgl_kredit', 'DESC')
    //       .take(1);

    //     return qb2;
    //   },
    //   'leadsclosingsaldote',
    //   'leadsclosingsaldote.leads_id = lcs.leads_id',
    // );

    q.leftJoin('outlet', 'outlet_leads', 'outlet_leads.kode = leads.kode_unit_kerja');
    if (filter.is_mo) {
      q.leftJoin('outlet', 'outlet', 'outlet.kode = leads.kode_unit_kerja');
    } else {
      q.leftJoin('outlet', 'outlet', 'outlet.kode = lcs.kode_unit_kerja');
    }
    q.leftJoin('outlet', 'outlet_cabang', 'outlet_cabang.kode = lcs.kode_unit_kerja_pencairan');
    q.leftJoin('outlet', 'outlet_p3', 'outlet_p3.kode = outlet.parent');
    q.leftJoin('outlet', 'outlet_p2', 'outlet_p2.kode = outlet_p3.parent');
    q.leftJoin('outlet', 'outlet_channel_syariah', 'lcs.channeling_syariah = outlet_channel_syariah.kode');
    q.leftJoin('produk', 'produk', 'produk.kode_produk = lcs.kode_produk');

    q.where('CAST(lcs.tgl_kredit AS date) = :date', { date: filter.date });

    if (filter.outlet_id && filter.outlet_id.length > 0 && filter.is_mo) {
      q.andWhere(
        'leads.kode_unit_kerja IN (:...kodeUnitKerja) AND (lcs.kode_unit_kerja IN (:...lcsUnitKerja) OR  lcs.kode_unit_kerja_pencairan IN (:...lcsUnitKerja))',
        {
          kodeUnitKerja: filter.outlet_id,
          lcsUnitKerja: filter.outlet_id,
        },
      );
    } else if (filter.outlet_id && filter.outlet_id.length > 0 && !filter.is_mo) {
      q.andWhere(
        '(lcs.kode_unit_kerja IN (:...kodeUnitKerja) OR lcs.kode_unit_kerja_pencairan IN (:...kodeUnitKerja))',
        {
          kodeUnitKerja: filter.outlet_id,
        },
      );
    }

    let count = null;

    if (filter.page && filter.limit && filter.offset !== null) {
      count = 0;
      const queryAndParams = await q.getQueryAndParameters();

      const getCount = await manager.query(`SELECT COUNT(*) FROM (${queryAndParams[0]}) count_data`, queryAndParams[1]);
      count = Number(getCount[0].count);

      q.limit(filter.limit);
      q.offset(filter.offset);
    }

    let orderType: 'ASC' | 'DESC' = 'ASC';
    if (filter.order_by) {
      // produk.nama_produk
      // leads.kode_unit_kerja
      // lcs.no_kontrak
      // outlet_cabang.nama
      // instansi.nama_instansi
      orderType = filter.order_type ?? 'ASC';
      q.orderBy(filter.order_by, orderType);
    } else {
      q.orderBy('lcs.tgl_kredit');
    }

    const data: QueryResultClosingReport[] = await q.getRawMany();
    await queryRunner.release();

    return {
      err: false,
      data,
      count: count ?? data.length,
    };
  } catch (error) {
    console.log('error', error);
    await queryRunner.release();
    return { err: error.message, data: null };
  }
};

export const p2kiReport = async (filter?: IFilterP2KI) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const q = manager.createQueryBuilder();
    q.from('pki_pengajuan', 'pp');
    q.select('pp.no_pengajuan', 'no_pengajuan');
    q.addSelect('pp.no_aplikasi_los', 'no_aplikasi_los');
    q.addSelect('pp.kode_channel', 'kode_channel');
    q.addSelect('pp.kode_produk', 'kode_produk');
    q.addSelect('pp.kode_instansi', 'kode_instansi');
    q.addSelect('produk.nama_produk', 'nama_produk');
    q.addSelect('pki_nasabah.nama', 'nama_nasabah');
    q.addSelect('pki_nasabah.no_hp', 'no_hp');
    q.addSelect('instansi.nama_instansi', 'nama_instansi');
    q.addSelect('outlet_instansi.nama', 'unit_kerja_instansi');
    q.addSelect('pp.tgl_pengajuan', 'tgl_pengajuan');
    q.addSelect('mra.prefix', 'mra_prefix');
    q.addSelect('mra.label', 'mra_label');
    q.addSelect("CONCAT(mra.prefix, ' - ',  mra.label)", 'mra_full');
    q.addSelect('pp.jumlah_pinjaman', 'jumlah_pinjaman');
    q.addSelect('pp.kode_outlet', 'kode_outlet');
    q.addSelect('outlet_pengajuan.nama', 'outlet_pengajuan');
    q.addSelect("CONCAT(pp.kode_outlet, ' - ',  outlet_pengajuan.nama)", 'outlet_pengajuan_full');
    q.addSelect('outlet_area_pengajuan.nama', 'area_pengajuan');
    q.addSelect('pp.status_pengajuan', 'kode_status_pengajuan');
    q.addSelect('msl.deskripsi_status_los', 'status_pengajuan');
    q.addSelect('msl.status_los', 'kode_status_los');
    q.addSelect("CONCAT(msl.status_los, ' - ', msl.deskripsi_status_los)", 'status_pengajuan_full');

    q.leftJoin('produk', 'produk', 'produk.kode_produk = pp.kode_produk');
    q.leftJoin('pki_nasabah', 'pki_nasabah', 'pki_nasabah.no_ktp = pp.no_ktp');
    q.leftJoin('instansi', 'instansi', 'instansi.id = pp.kode_instansi');
    q.leftJoin('outlet', 'outlet_instansi', 'outlet_instansi.kode = instansi.kode_unit_kerja');
    q.leftJoin('pki_agunan', 'pki_agunan', 'pki_agunan.no_pengajuan = pp.no_pengajuan');
    q.leftJoin('master_rubrik_agunan', 'mra', 'mra.kode = pki_agunan.jenis_agunan');
    q.leftJoin('master_status_los', 'master_status_los', 'master_status_los.id_status_microsite = pp.status_pengajuan');
    q.leftJoin('outlet', 'outlet_pengajuan', 'outlet_pengajuan.kode = pp.kode_outlet');
    q.leftJoin('outlet', 'outlet_area_pengajuan', 'outlet_area_pengajuan.kode = outlet_pengajuan.parent');
    q.leftJoin('master_status_los', 'msl', 'pp.status_pengajuan = msl.id_status_microsite');

    q.where('CAST(pp.tgl_pengajuan AS date) >= :startDate', { startDate: filter.start_date });
    q.andWhere('CAST(pp.tgl_pengajuan AS date) <= :endDate', { endDate: filter.end_date });

    if (filter.no_pengajuan) {
      q.andWhere(`pp.no_pengajuan ~* :noPengajuan`, { noPengajuan: filter.no_pengajuan });
    }

    if (filter.kode_produk) {
      q.andWhere('pp.kode_produk = :kodeProduk', { kodeProduk: filter.kode_produk });
    }

    if (filter.instansi_id) {
      q.andWhere('pp.kode_instansi = :kodeInstansi', { kodeInstansi: filter.instansi_id });
    }

    if (filter.kode_status_pengajuan) {
      q.andWhere('pp.status_pengajuan = :statusPengajuan', { statusPengajuan: filter.kode_status_pengajuan });
    }

    if (filter.nama) {
      q.andWhere('pki_nasabah.nama ~* :nama', { nama: filter.nama });
    }

    if (filter.kode_outlet) {
      q.andWhere(`pp.kode_outlet IN (${getRecursiveOutletQuery(filter.kode_outlet)})`);
    }

    let count = null;

    if (filter.page && filter.limit && filter.offset !== null) {
      count = await q.getCount();

      q.limit(filter.limit);
      q.offset(filter.offset);
    }

    q.orderBy('pp.tgl_pengajuan', 'DESC');

    const data: QueryResultClosingReport[] = await q.getRawMany();
    await queryRunner.release();

    return {
      err: false,
      data,
      count: count,
    };
  } catch (error) {
    await queryRunner.release();
    return { err: error.message, data: null };
  }
};

// minus nilai persen per transaksi dan nilai penyerapan
export const promosiReport = async (filter?: IFilter) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;
  try {
    const q = manager.createQueryBuilder();
    q.from('promo', 'p');
    q.select('p.id', 'id');
    q.addSelect('p.nama_promosi', 'nama_promosi');
    q.addSelect('produk.nama_produk', 'nama_produk');
    q.addSelect('p.jenis_promosi', 'jenis_promosi');
    q.addSelect('p.start_date', 'start_date');
    q.addSelect('p.end_date', 'end_date');
    q.addSelect('coalesce(p.total_promosi,0)', 'total_promosi');
    q.addSelect('p.nilai_per_transaksi', 'nilai_per_transaksi');

    q.addSelect((subQuery) => {
      return subQuery
        .select('pv2.potongan_persentase')
        .from('promo_voucher', 'pv2')
        .where('pv2.promo_id =  p.id')
        .limit(1);
    }, 'nilai_persen_per_transaksi');

    q.addSelect(`sum(coalesce(abc.up2, 0))`, 'nilai_penyerapan');

    q.leftJoin('produk', 'produk', 'produk.kode_produk = p.kode_produk');
    q.leftJoin('promo_voucher', 'pv', 'pv.promo_id = p.id');
    q.leftJoin('pki_pengajuan', 'pp', 'pp.kode_voucher = pv.kode_voucher');
    q.leftJoin(
      'leads_closing',
      'lcs',
      'lcs.nik_ktp = pp.no_ktp and lcs.tgl_kredit > cast(pp.created_at as date) and lcs.kode_produk = pp.kode_produk',
    );

    q.leftJoin(
      (qb: SelectQueryBuilder<any>) => {
        return qb
          .select('sum(pp2.up)', 'up2')
          .addSelect('p2.id', 'id2')
          .from('promo', 'p2')
          .innerJoin('pki_pengajuan', 'pp2', 'pp2.promo_id = p2.id')
          .groupBy('p2.id')
          .addGroupBy('pp2.up');
      },
      'abc',
      'abc.id2 = p.id',
    );

    if (filter.start_date && filter.end_date) {
      q.where('CAST(p.start_date AS date) >= :startDate', { startDate: filter.start_date });
      q.orWhere('CAST(p.end_date AS date) <= :endDate', { endDate: filter.end_date });
    }

    let count = null;

    if (filter.page && filter.limit && filter.offset !== null) {
      count = await q.getCount();

      q.limit(filter.limit);
      q.offset(filter.offset);
    }

    q.groupBy('p.id');
    q.addGroupBy('produk.nama_produk');
    q.addGroupBy('abc.up2');

    const data = await q.getRawMany();
    await queryRunner.release();

    return {
      err: false,
      data,
      count: count ?? data.length,
    };
  } catch (error) {
    await queryRunner.release();
    return { err: error.message, data: null };
  }
};

// report closing: minus nilai promosi
export const promosiClosingReport = async (filter?: IFilter) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const q = manager.createQueryBuilder();
    q.from('leads', 'leads');
    q.select('leads.nik_ktp', 'nik_ktp_nasabah');
    q.addSelect('lcs.tgl_kredit', 'tgl_kredit');
    q.addSelect('lcs.tgl_fpk', 'tgl_fpk');
    q.addSelect('leads.nama', 'nama_nasabah');
    q.addSelect('lcs.cif', 'cif');
    q.addSelect('leads.no_hp', 'no_hp_nasabah');
    q.addSelect('leads.is_karyawan', 'is_karyawan');
    q.addSelect('leads.kode_produk', 'kode_produk');
    q.addSelect('leads.instansi_id', 'instansi_id');
    q.addSelect('instansi.jenis_instansi', 'jenis_instansi');
    q.addSelect('instansi.nama_instansi', 'nama_instansi');
    q.addSelect('outlet_instansi.nama', 'unit_kerja_instansi');
    q.addSelect('outlet_transaksi.nama', 'outlet_transaksi');
    q.addSelect('leads.event_id', 'event_id');
    q.addSelect('leads.created_by', 'created_by');
    q.addSelect('leads.created_at', 'created_at');
    q.addSelect('leads.step', 'step');
    q.addSelect('leads.is_ktp_valid', 'is_ktp_valid');
    q.addSelect('leads.flag_app', 'flag_app');
    q.addSelect('leads.kode_unit_kerja', 'kode_unit_kerja');
    q.addSelect('outlet.nama', 'nama_unit_kerja');
    q.addSelect('outlet.unit_kerja', 'unit');
    q.addSelect('produk.nama_produk', 'nama_produk');
    q.addSelect('lcs.no_kontrak', 'no_kontrak');
    q.addSelect('lcs.channel', 'channel');
    q.addSelect('lcs.kode_unit_kerja_pencairan', 'kode_unit_kerja_pencairan'); // promo
    q.addSelect('lcs.up', 'uang_pinjaman'); // promo
    q.addSelect('pki_pengajuan.promo_id', 'promo_id'); //promo
    q.addSelect('promo.nama_promosi', 'nama_promosi'); //promo
    q.addSelect(
      'CASE WHEN pv.potongan_persentase <> 0 THEN pv.potongan_persentase * pki_pengajuan.up / 100 ELSE pv.potongan_rp END',
      'nilai_promosi',
    ); // promosi

    // q.addSelect((subQuery) => {
    //   return subQuery
    //     .select('sum()')
    //     .from('leads_closing', 'lc2')
    //     .where('lc2.no_kontrak = lcs.no_kontrak AND osl IS NOT NULL')
    //     .limit(1);
    // }, 'osl');

    q.leftJoin('instansi', 'instansi', 'instansi.id = leads.instansi_id');
    q.leftJoin('outlet', 'outlet_instansi', 'outlet_instansi.kode = instansi.kode_unit_kerja');
    q.leftJoin('outlet', 'outlet', 'outlet.kode = leads.kode_unit_kerja');
    q.innerJoin('leads_closing', 'lcs', 'lcs.leads_id = leads.id');
    q.leftJoin('produk', 'produk', 'produk.kode_produk = lcs.kode_produk');
    q.innerJoin(
      'pki_pengajuan',
      'pki_pengajuan',
      'pki_pengajuan.no_ktp = lcs.nik_ktp and pki_pengajuan.kode_produk = lcs.kode_produk',
    );
    q.leftJoin('promo', 'promo', 'promo.id = pki_pengajuan.promo_id');
    q.leftJoin('outlet', 'outlet_transaksi', 'outlet_transaksi.kode = lcs.kode_unit_kerja_pencairan');
    q.leftJoin('promo_voucher', 'pv', 'pv.kode_voucher = pki_pengajuan.kode_voucher');

    q.where('CAST(lcs.tgl_kredit AS date) >= :startDate', { startDate: filter.start_date });
    q.andWhere('CAST(lcs.tgl_kredit AS date) <= :endDate', { endDate: filter.end_date });
    q.andWhere('CAST(lcs.tgl_kredit AS date) >= pki_pengajuan.tgl_pengajuan');

    if (filter.outlet_id && filter.outlet_id.length > 0) {
      q.andWhere('leads.kode_unit_kerja IN (:...kodeUnitKerja)', { kodeUnitKerja: filter.outlet_id });
    }

    if (filter.created_by) {
      q.andWhere('leads.created_by = :userId', { userId: filter.created_by });
    }

    let count = null;

    if (filter.page && filter.limit && filter.offset !== null) {
      count = await q.getCount();

      q.limit(filter.limit);
      q.offset(filter.offset);
    }

    q.orderBy('lcs.tgl_kredit');
    const data: QueryResultClosingReport[] = await q.getRawMany();
    await queryRunner.release();

    return {
      err: false,
      data,
      count: count ?? data.length,
    };
  } catch (error) {
    await queryRunner.release();
    return { err: error.message, data: null };
  }
};

// report closing: minus nilai promosi
export const promosiClosingReportV2 = async (filter?: IFilter) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    const q = manager.createQueryBuilder();
    q.from('pki_pengajuan', 'pp');
    q.select('pp.up', 'up');
    q.addSelect('outlet.nama', 'nama_putlet');
    q.addSelect('promo.id', 'id_promosi'); //promo
    q.addSelect('promo.nama_promosi', 'nama_promosi'); //promo
    q.addSelect('leads.nama', 'nama');
    q.addSelect('lc.cif', 'cif');
    q.addSelect('lc.no_kontrak', 'no_kontrak');
    q.addSelect('lc.tgl_kredit', 'tgl_kredit');
    q.addSelect('produk.nama_produk', 'nama_produk');
    q.addSelect('pp.kode_voucher', 'kode_voucher');
    q.addSelect('pv.potongan_rp', 'potongan_rp');
    q.addSelect(
      'CASE WHEN pv.potongan_persentase <> 0 THEN pv.potongan_persentase * pp.up / 100 ELSE pv.potongan_rp END',
      'nilai_penyerapan',
    );

    q.leftJoin('outlet', 'outlet', 'outlet.kode = pp.kode_outlet');
    q.leftJoin('promo', 'promo', 'promo.id = pp.promo_id');
    q.leftJoin('produk', 'produk', 'produk.kode_produk = pp.kode_produk');
    q.leftJoin('leads', 'leads', 'leads.nik_ktp = pp.no_ktp');
    q.leftJoin('leads_closing', 'lc', 'leads.nik_ktp = lc.nik_ktp and lc.kode_produk = pp.kode_produk');
    q.leftJoin('promo_voucher', 'pv', 'pv.kode_voucher = pp.kode_voucher');

    q.where('CAST(lc.tgl_kredit AS date) >= :startDate', { startDate: filter.start_date });
    q.andWhere('CAST(lc.tgl_kredit AS date) <= :endDate', { endDate: filter.end_date });
    q.andWhere('CAST(lc.tgl_kredit AS date) >= pp.tgl_pengajuan');

    if (filter.outlet_id && filter.outlet_id.length > 0) {
      q.andWhere('leads.kode_unit_kerja IN (:...kodeUnitKerja)', { kodeUnitKerja: filter.outlet_id });
    }

    if (filter.created_by) {
      q.andWhere('leads.created_by = :userId', { userId: filter.created_by });
    }

    let count = null;

    if (filter.page && filter.limit && filter.offset !== null) {
      count = await q.getCount();

      q.limit(filter.limit);
      q.offset(filter.offset);
    }

    q.orderBy('lc.tgl_kredit');
    const data: QueryResultClosingReport[] = await q.getRawMany();
    await queryRunner.release();

    return {
      err: false,
      data,
      count: count ?? data.length,
    };
  } catch (error) {
    await queryRunner.release();
    return { err: error.message, data: null };
  }
};

const reportSvc = {
  instansiReport,
  eventReport,
  leadsReport,
  closingReport,
  p2kiReport,
  promosiReport,
};

export default reportSvc;
