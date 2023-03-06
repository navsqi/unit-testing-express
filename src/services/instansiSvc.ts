import { Between, ILike, Raw, SelectQueryBuilder } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import Instansi from '~/orm/entities/Instansi';
import MasterInstansi from '~/orm/entities/MasterInstansi';
import { getRecursiveOutletQuery } from './konsolidasiSvc';

const masterInsRepo = dataSource.getRepository(MasterInstansi);
const instansiRepo = dataSource.getRepository(Instansi);

export const listMasterInstansi = async (filter: any, paging: any): Promise<[MasterInstansi[], number]> => {
  const f: { [key: string]: any } = {};

  if (filter.nama_instansi) {
    f['nama_instansi'] = ILike(`%${filter.nama_instansi}%`);
  }

  if (filter.jenis_instansi) {
    f['jenis_instansi'] = filter.jenis_instansi;
  }

  if (filter.start_date && filter.end_date) {
    f['created_at'] = Between(new Date(`${filter.start_date} 00:00:00`), new Date(`${filter.end_date} 23:59:59`));
  }

  f['is_deleted'] = filter.is_deleted;

  const [masterInstansi, count] = await masterInsRepo.findAndCount({
    select: {
      cakupan_instansi: {
        nama: true,
        unit_kerja: true,
      },
    },
    take: paging.limit,
    skip: paging.offset,
    where: f,
    order: {
      created_at: 'desc',
    },
    relations: {
      cakupan_instansi: true,
    },
  });

  return [masterInstansi, count];
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
    f['created_at'] = Between(new Date(`${filter.start_date} 00:00:00`), new Date(`${filter.end_date} 23:59:59`));
  }

  // if (filter.outlet_id && filter.outlet_id.length > 0) {
  //   f['kode_unit_kerja'] = In(filter.outlet_id);
  // }

  if (filter.kode_outlet && !filter.kode_outlet.startsWith('000')) {
    f['kode_unit_kerja'] = Raw((alias) => `${alias} IN (${getRecursiveOutletQuery(filter.kode_outlet)})`);
  }

  if (filter.kategori_instansi) {
    f['kategori_instansi'] = filter.kategori_instansi;
  }

  if (filter.jenis_instansi) {
    f['jenis_instansi'] = filter.jenis_instansi;
  }

  if (filter.status_potensial) {
    f['status_potensial'] = filter.status_potensial;
  }

  f['is_deleted'] = filter.is_deleted;

  const f2 = {
    ...f,
  };

  delete f2['kode_unit_kerja'];

  // ...f, created_by: filter.user_nik
  const fWithOr =
    Object.keys(f).length > 0 ? [f, { ...f2, unit_assign: Raw((alias) => `${alias} ~* '${filter.unit_assign}'`) }] : f;

  const [instansi, count] = await instansiRepo.findAndCount({
    take: paging.limit,
    skip: paging.offset,
    where: fWithOr,
    select: {
      master_instansi: {
        id: true,
        nama_instansi: true,
      },
      cakupan_instansi: {
        nama: true,
        unit_kerja: true,
      },
      sarana_media: {
        deskripsi: true,
      },
      organisasi_pegawai: {
        deskripsi: true,
      },
    },
    order: {
      created_at: 'desc',
      nama_instansi: 'asc',
    },
    relations: {
      master_instansi: true,
      cakupan_instansi: true,
      sarana_media: true,
      organisasi_pegawai: true,
    },
  });

  return [instansi, count];
};

export const listInstansiV2 = async (paging: any, filter?: any) => {
  const instansi = dataSource
    .createQueryBuilder(Instansi, 'i')
    .select('i.id')
    .addSelect(`CONCAT(i.id,' - ', i.nama_instansi)`, 'nama_instansi')
    .addSelect('COALESCE(ai.count_assignment, 0)', 'count_assignment')
    .addSelect(`CONCAT(mi.id,' - ', mi.nama_instansi)`, 'nama_master_instansi')
    .addSelect('i.alamat', 'alamat')
    .addSelect('i.created_at', 'created_at')
    .addSelect('i.is_approved', 'is_approved')
    .addSelect('i.is_deleted', 'is_deleted')
    .addSelect('i.status_potensial', 'status_potensial')
    .innerJoin('i.master_instansi', 'mi')
    .leftJoinAndMapOne(
      'i.count_assignment',
      (qb) => {
        const q = qb as SelectQueryBuilder<any>;

        q.from('assignment_instansi', 'ai')
          .select('COUNT(*)', 'count_assignment')
          .addSelect('ai.instansi_id', 'instansi_id')
          .groupBy('instansi_id');

        return q;
      },
      'ai',
      'ai.instansi_id = i.id',
    );

  // if (filter.nama_instansi) {
  //   instansi.andWhere('instansi.nama_instansi ~* :nama', { nama: filter.nama_instansi });
  // }

  const res = await instansi.limit(paging.limit).skip(paging.offset).getRawMany();

  return res;
};
