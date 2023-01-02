import { Between, ILike, Raw } from 'typeorm';
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

  console.log(filter);
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

  const f2 = {
    ...f,
  };

  delete f2['kode_unit_kerja'];

  console.log(f);
  console.log(f2);

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
