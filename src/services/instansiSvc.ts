import { Between, ILike, Raw, SelectQueryBuilder } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import Instansi from '~/orm/entities/Instansi';
import MasterInstansi from '~/orm/entities/MasterInstansi';
import { IPaging } from '~/utils/queryHelper';
import { getRecursiveOutletQuery } from './konsolidasiSvc';

const masterInsRepo = dataSource.getRepository(MasterInstansi);
const instansiRepo = dataSource.getRepository(Instansi);

export interface IFilterInstansi {
  nama_instansi?: string;
  start_date?: string;
  end_date?: string;
  kode_outlet?: string;
  kode_unit_kerja?: string;
  kategori_instansi?: string;
  jenis_instansi?: string;
  status_potensial?: string;
  is_deleted?: boolean;
  is_approved?: number;
  unit_assign?: string;
  user_nik?: string;
  is_assign?: number;
  order_by?: string;
  order_type?: string;
  is_dropdown?: boolean;
}

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

export const listInstansiV2 = async (paging: IPaging, filter?: IFilterInstansi) => {
  const instansi = dataSource
    .createQueryBuilder(Instansi, 'i')
    .select('i.id', 'instansi_id')
    .addSelect(`CONCAT(i.id,' - ', i.nama_instansi)`, 'nama_instansi')
    .addSelect(`CONCAT(mi.id,' - ', mi.nama_instansi)`, 'nama_master_instansi');

  if (!filter.is_dropdown) {
    instansi
      .addSelect('COALESCE(ai.count_assignment, 0)', 'count_assignment')
      .addSelect('i.alamat', 'alamat')
      .addSelect('i.created_at', 'created_at')
      .addSelect(`i.is_approved`, 'is_approved')
      .addSelect(`(CASE WHEN i.is_approved = 1 THEN 'DISETUJUI' ELSE 'PENGAJUAN' END)`, 'status')
      .addSelect('i.is_deleted', 'is_deleted')
      .addSelect('i.status_potensial', 'status_potensial')
      .addSelect('o.nama', 'cakupan_instansi')
      .innerJoin('i.cakupan_instansi', 'o')
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
  }

  instansi.innerJoin('i.master_instansi', 'mi');

  let whereClause1 = 'i.is_deleted = :isDeleted ';
  const bindParams1: { [key: string]: any } = { isDeleted: filter.is_deleted };

  let whereClause2 = 'i.is_deleted = :isDeleted ';
  let bindParams2: { [key: string]: any } = { isDeleted: filter.is_deleted };

  if (typeof filter.is_approved == 'number') {
    whereClause1 += 'AND i.is_approved = :isApproved ';
    bindParams1.isApproved = filter.is_approved;
  }

  if (filter.start_date && filter.end_date) {
    whereClause1 += 'AND i.created_at >= :startDate and i.created_at <= :endDate ';
    bindParams1.startDate = new Date(`${filter.start_date} 00:00:00`);
    bindParams1.endDate = new Date(`${filter.end_date} 23:59:59`);
  }

  if (filter.kategori_instansi) {
    whereClause1 += 'AND i.kategori_instansi = :kategoriInstansi ';
    bindParams1.kategoriInstansi = filter.kategori_instansi;
  }

  if (filter.nama_instansi) {
    whereClause1 += 'AND i.nama_instansi ~* :namaInstansi ';
    bindParams1.namaInstansi = filter.nama_instansi;
  }

  if (filter.jenis_instansi) {
    whereClause1 += 'AND i.jenis_instansi = :jenisInstansi ';
    bindParams1.jenisInstansi = filter.jenis_instansi;
  }

  if (filter.status_potensial) {
    whereClause1 += 'AND i.status_potensial = :statusPotensial ';
    bindParams1.statusPotensial = filter.status_potensial;
  }

  whereClause2 = whereClause1;
  bindParams2 = bindParams1;

  if (filter.kode_outlet && !filter.kode_outlet.startsWith('000')) {
    whereClause1 += `AND i.kode_unit_kerja IN (${getRecursiveOutletQuery(filter.kode_outlet)}) `;
  }

  instansi.where(whereClause1, bindParams1).orWhere(whereClause2, bindParams2);

  if (paging.limit && paging.offset) {
    instansi.take(paging.limit).skip(paging.offset);
  }

  instansi.orderBy('i.is_approved', 'ASC').addOrderBy('i.created_at', 'DESC');
  instansi.limit(paging.limit).skip(paging.offset);
  const count = await instansi.getCount();
  const res = await instansi.getRawMany();

  return [res, count];
};
