import { Between, ILike, In, SelectQueryBuilder } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import Instansi from '~/orm/entities/Instansi';
import MasterInstansi from '~/orm/entities/MasterInstansi';

const masterInsRepo = dataSource.getRepository(MasterInstansi);
const instansiRepo = dataSource.getRepository(Instansi);

export const leadsReport = async (filter?: any, paging?: any) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  const manager = queryRunner.manager;

  try {
    console.log('HELLO REPORT');
    const q = manager.createQueryBuilder();
    q.from('leads', 'leads');
    q.select('leads.nik_ktp', 'nik_ktp_nasabah');
    q.addSelect('leads.nama', 'nama_nasabah');
    q.addSelect('leads.no_hp', 'no_hp_nasabah');
    q.addSelect('leads.is_karyawan', 'is_karyawan');
    q.addSelect('leads.kode_produk', 'kode_produk');
    q.addSelect('leads.instansi_id', 'instansi_id');
    q.addSelect('instansi.jenis_instansi', 'jenis_instansi');
    q.addSelect('instansi.nama_instansi', 'nama_instansi');
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
    q.addSelect('outlet_p3.nama', 'nama_unit_kerja_parent_3');
    q.addSelect('outlet_p2.nama', 'nama_unit_kerja_parent_2');
    q.addSelect('COALESCE(leadsclosing.omset, 0)', 'omset');
    q.addSelect('COALESCE(leadsclosing.osl, 0)', 'osl');

    q.leftJoin('event', 'event', 'event.id = leads.event_id');
    q.leftJoin('instansi', 'instansi', 'instansi.id = leads.instansi_id');
    q.leftJoin('outlet', 'outlet', 'outlet.kode = leads.kode_unit_kerja');
    q.leftJoin('outlet', 'outlet_p3', 'outlet_p3.kode = outlet.parent');
    q.leftJoin('outlet', 'outlet_p2', 'outlet_p2.kode = outlet_p3.parent');

    q.leftJoin(
      (qb) => {
        const qb2 = qb as SelectQueryBuilder<any>;

        qb2
          .from('leads_closing', 'lcs')
          .addSelect('lcs.nik_ktp', 'nik_ktp')
          .addSelect('SUM(lcs.up)', 'omset')
          .addSelect('SUM(lcs.osl)', 'osl')
          .addSelect('SUM(lcs.saldo_tabemas)', 'saldo_tabemas')
          .groupBy('lcs.nik_ktp');

        return qb2;
      },
      'leadsclosing',
      'leadsclosing.nik_ktp = leads.nik_ktp',
    );

    q.where('CAST(leads.created_at AS date) >= :startDate', { startDate: '2022-08-01' });
    q.andWhere('CAST(leads.created_at AS date) <= :endDate', { endDate: '2022-08-30' });
    q.andWhere('leads.kode_unit_kerja IN (:...kodeUnitKerja)', { kodeUnitKerja: ['12300', '00042'] });

    const data = await q.getRawMany();

    return {
      err: false,
      data,
    };
  } catch (error) {
    await queryRunner.release();
    return { err: error.message, data: null };
  }
};

export const listInstansi = async (filter: any, paging: any): Promise<[Instansi[], number]> => {
  const f: { [key: string]: any } = {};

  if (filter.nama_instansi) {
    f['nama_instansi'] = ILike(`%${filter.nama_instansi}%`);
  }

  if (typeof filter.is_approved == 'number') {
    f['is_approved'] = filter.is_approved;
  }

  if (filter.start_date && filter.end_date) {
    f['created_at'] = Between(new Date(`${filter.start_date} 00:00:00`), new Date(`${filter.end_date} 00:00:00`));
  }

  if (filter.outlet_id && filter.outlet_id.length > 0) {
    f['kode_unit_kerja'] = In(filter.outlet_id);
  }

  const [instansi, count] = await instansiRepo.findAndCount({
    take: paging.limit,
    skip: paging.offset,
    where: f,
    relations: {
      master_instansi: true,
    },
  });

  return [instansi, count];
};
