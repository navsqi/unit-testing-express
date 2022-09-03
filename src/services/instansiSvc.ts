import { Between, ILike, In } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import Instansi from '~/orm/entities/Instansi';
import MasterInstansi from '~/orm/entities/MasterInstansi';

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
    take: paging.limit,
    skip: paging.offset,
    where: f,
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

  if (filter.outlet_id && filter.outlet_id.length > 0) {
    f['kode_unit_kerja'] = In(filter.outlet_id);
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

  const fWithOr = Object.keys(f).length > 0 ? [f, { ...f, created_by: filter.user_nik }] : f;

  const [instansi, count] = await instansiRepo.findAndCount({
    take: paging.limit,
    skip: paging.offset,
    where: fWithOr,
    select: {
      master_instansi: {
        id: true,
        nama_instansi: true,
      },
    },
    relations: {
      master_instansi: true,
    },
  });

  return [instansi, count];
};
