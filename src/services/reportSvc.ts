import { SelectQueryBuilder } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import { QueryResultClosingReport } from '~/types/reportTypes';

interface IFilter {
  start_date: string;
  end_date: string;
  outlet_id?: string[];
  user_id?: any;
  created_by?: any;
  page?: number;
  limit?: number;
  offset?: any;
}

interface IFilterP2KI {
  no_pengajuan?: string;
  nama?: string;
  start_date?: string;
  end_date?: string;
  kode_produk?: string;
  instansi_id?: any;
  status_pengajuan?: any;
  page?: number;
  limit?: number;
  offset?: any;
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
    q.addSelect('user_update.nama', 'updated_by');
    q.addSelect('i.id', 'id_instansi');
    q.addSelect('mi.nama_instansi', 'nama_master_instansi');
    q.addSelect('i.nama_instansi', 'nama_instansi');
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
          .addSelect('sum(lcs.osl)', 'osl')
          .addSelect('sum(lcs.saldo_tabemas)', 'saldo_tabemas')
          .innerJoin('leads_closing', 'lcs', 'lcs.leads_id = l.id')
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
    q.addSelect('outlet.nama', 'nama_unit_kerja');
    q.addSelect('outlet.unit_kerja', 'unit');
    q.addSelect('outlet_p3.nama', 'nama_unit_kerja_parent_3');
    q.addSelect('outlet_p3.unit_kerja', 'unit_parent_3');
    q.addSelect('outlet_p2.nama', 'nama_unit_kerja_parent_2');
    q.addSelect('outlet_p2.unit_kerja', 'unit_parent_2');
    q.addSelect('coalesce(leads.countall, 0)', 'jumlah_prospek');
    q.leftJoin('instansi', 'i', 'i.id = e.instansi_id');
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
          .addSelect('count(*)', 'countall')
          .where('l.status = 1')
          .groupBy('l.event_id');

        return qb2;
      },
      'leads',
      'leads.event_id = e.id',
    );

    q.where('CAST(e.tanggal_event AS date) >= :startDate', { startDate: filter.start_date });
    q.andWhere('CAST(e.tanggal_event AS date) <= :endDate', { endDate: filter.end_date });

    if (filter.outlet_id && filter.outlet_id.length > 0) {
      q.andWhere('e.kode_unit_kerja IN (:...kodeUnitKerja)', { kodeUnitKerja: filter.outlet_id });
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
    q.addSelect('leadsclosing.cif', 'cif');
    q.addSelect('leads.nama', 'nama_nasabah');
    q.addSelect('leads.no_hp', 'no_hp_nasabah');
    q.addSelect('leads.is_karyawan', 'is_karyawan');
    q.addSelect('leads.is_ktp_valid', 'is_ktp_valid');
    q.addSelect('leads.instansi_id', 'instansi_id');
    q.addSelect('instansi.jenis_instansi', 'jenis_instansi');
    q.addSelect('master_instansi.nama_instansi', 'nama_master_instansi');
    q.addSelect('instansi.nama_instansi', 'nama_instansi');
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
    q.addSelect('outlet.nama', 'nama_unit_kerja');
    q.addSelect('outlet.unit_kerja', 'unit');
    q.addSelect('outlet_p3.nama', 'nama_unit_kerja_parent_3');
    q.addSelect('outlet_p3.unit_kerja', 'unit_parent_3');
    q.addSelect('outlet_p2.nama', 'nama_unit_kerja_parent_2');
    q.addSelect('outlet_p2.unit_kerja', 'unit_parent_2');
    q.addSelect('leadsclosing.kode_produk', 'kode_produk');
    q.addSelect('produk.nama_produk', 'nama_produk');
    q.addSelect('COALESCE(leadsclosing.omset, 0)', 'omset');
    q.addSelect('COALESCE(leadsclosing.osl, 0)', 'osl');
    q.addSelect('COALESCE(leadsclosing.saldo_tabemas, 0)', 'saldo_tabemas');

    q.leftJoin('event', 'event', 'event.id = leads.event_id');
    q.leftJoin('instansi', 'instansi', 'instansi.id = leads.instansi_id');
    q.leftJoin('master_instansi', 'master_instansi', 'master_instansi.id = instansi.master_instansi_id');
    q.leftJoin('outlet', 'outlet_instansi', 'outlet_instansi.kode = instansi.kode_unit_kerja');
    q.leftJoin('outlet', 'outlet', 'outlet.kode = leads.kode_unit_kerja');
    q.leftJoin('outlet', 'outlet_p3', 'outlet_p3.kode = outlet.parent');
    q.leftJoin('outlet', 'outlet_p2', 'outlet_p2.kode = outlet_p3.parent');

    q.leftJoin(
      (qb) => {
        const qb2 = qb as SelectQueryBuilder<any>;

        qb2
          .from('leads_closing', 'lcs')
          .addSelect('lcs.nik_ktp', 'nik_ktp')
          .addSelect('lcs.cif', 'cif')
          .addSelect('lcs.kode_produk', 'kode_produk')
          .addSelect('SUM(lcs.up)', 'omset')
          .addSelect('SUM(lcs.osl)', 'osl')
          .addSelect('SUM(lcs.saldo_tabemas)', 'saldo_tabemas')
          .groupBy('lcs.nik_ktp')
          .addGroupBy('lcs.kode_produk')
          .addGroupBy('lcs.cif');

        return qb2;
      },
      'leadsclosing',
      'leadsclosing.nik_ktp = leads.nik_ktp OR leadsclosing.cif = leads.cif',
    );

    q.leftJoin('produk', 'produk', 'produk.kode_produk = leadsclosing.kode_produk');

    q.where('CAST(leads.created_at AS date) >= :startDate', { startDate: filter.start_date });
    q.andWhere('CAST(leads.created_at AS date) <= :endDate', { endDate: filter.end_date });

    if (filter.outlet_id && filter.outlet_id.length > 0) {
      q.andWhere('leads.kode_unit_kerja IN (:...kodeUnitKerja)', { kodeUnitKerja: filter.outlet_id });
    }

    if (filter.user_id) {
      q.andWhere('leads.created_by = :userId', { userId: filter.user_id });
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
    q.addSelect('instansi.jenis_instansi', 'jenis_instansi');
    q.addSelect('master_instansi.nama_instansi', 'nama_master_instansi');
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
    q.addSelect('outlet.unit_kerja', 'unit');
    q.addSelect('outlet_p3.nama', 'nama_unit_kerja_parent_3');
    q.addSelect('outlet_p3.unit_kerja', 'unit_parent_3');
    q.addSelect('outlet_p2.nama', 'nama_unit_kerja_parent_2');
    q.addSelect('outlet_p2.unit_kerja', 'unit_parent_2');
    q.addSelect('produk.nama_produk', 'nama_produk');
    q.addSelect('lcs.no_kontrak', 'no_kontrak');
    q.addSelect('lcs.channel', 'channel');
    q.addSelect('lcs.up', 'omset');
    q.addSelect((subQuery) => {
      return subQuery
        .select('osl')
        .from('leads_closing', 'lc2')
        .where('lc2.no_kontrak = lcs.no_kontrak AND osl IS NOT NULL')
        .limit(1);
    }, 'osl');
    q.addSelect((subQuery) => {
      return subQuery
        .select('saldo_tabemas')
        .from('leads_closing', 'lc2')
        .where('lc2.no_kontrak = lcs.no_kontrak AND saldo_tabemas IS NOT NULL')
        .limit(1);
    }, 'saldo_tabemas');
    q.addSelect('coalesce(lcs.osl, 0)', 'osl_original');
    // q.addSelect('coalesce(lcs.saldo_tabemas, 0)', 'saldo_tabemas');

    q.leftJoin('event', 'event', 'event.id = leads.event_id');
    q.leftJoin('instansi', 'instansi', 'instansi.id = leads.instansi_id');
    q.leftJoin('master_instansi', 'master_instansi', 'master_instansi.id = instansi.master_instansi_id');
    q.leftJoin('outlet', 'outlet_instansi', 'outlet_instansi.kode = instansi.kode_unit_kerja');
    q.leftJoin('outlet', 'outlet', 'outlet.kode = leads.kode_unit_kerja');
    q.leftJoin('outlet', 'outlet_p3', 'outlet_p3.kode = outlet.parent');
    q.leftJoin('outlet', 'outlet_p2', 'outlet_p2.kode = outlet_p3.parent');
    q.innerJoin('leads_closing', 'lcs', 'lcs.leads_id = leads.id');
    q.leftJoin('produk', 'produk', 'produk.kode_produk = lcs.kode_produk');

    q.where('CAST(lcs.tgl_kredit AS date) >= :startDate', { startDate: filter.start_date });
    q.andWhere('CAST(lcs.tgl_kredit AS date) <= :endDate', { endDate: filter.end_date });

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
    q.addSelect('instansi.nama_instansi', 'nama_instansi');
    q.addSelect('outlet_instansi.nama', 'unit_kerja_instansi');
    q.addSelect('pp.tgl_pengajuan', 'tgl_pengajuan');
    q.addSelect('mra.prefix', 'mra_prefix');
    q.addSelect('mra.label', 'mra_label');
    q.addSelect('pp.kode_outlet', 'kode_outlet');
    q.addSelect('outlet_pengajuan.nama', 'outlet_pengajuan');
    q.addSelect('pp.status_pengajuan', 'kode_status_pengajuan');
    q.addSelect('msl.deskripsi_status_los', 'status_pengajuan');
    q.addSelect('msl.status_los', 'kode_status_los');

    q.leftJoin('produk', 'produk', 'produk.kode_produk = pp.kode_produk');
    q.leftJoin('pki_nasabah', 'pki_nasabah', 'pki_nasabah.no_ktp = pp.no_ktp');
    q.leftJoin('instansi', 'instansi', 'instansi.id = pp.kode_instansi');
    q.leftJoin('outlet', 'outlet_instansi', 'outlet_instansi.kode = instansi.kode_unit_kerja');
    q.leftJoin('pki_agunan', 'pki_agunan', 'pki_agunan.no_pengajuan = pp.no_pengajuan');
    q.leftJoin('master_rubrik_agunan', 'mra', 'mra.kode = pki_agunan.jenis_agunan');
    q.leftJoin('master_status_los', 'master_status_los', 'master_status_los.id_status_microsite = pp.status_pengajuan');
    q.leftJoin('outlet', 'outlet_pengajuan', 'outlet_pengajuan.kode = pp.kode_outlet');
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

    if (filter.status_pengajuan) {
      q.andWhere('pp.status_pengajuan = :statusPengajuan', { statusPengajuan: filter.status_pengajuan });
    }

    if (filter.nama) {
      q.andWhere('pki_nasabah.nama = :nama', { nama: filter.nama });
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
