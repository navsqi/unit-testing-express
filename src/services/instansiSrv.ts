import { Between, ILike } from 'typeorm';
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

  if (filter.start_date && filter.end_date) {
    f['created_at'] = Between(new Date(`${filter.start_date} 00:00:00`), new Date(`${filter.end_date} 00:00:00`));
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
    f['created_at'] = Between(new Date(`${filter.start_date} 00:00:00`), new Date(`${filter.end_date} 00:00:00`));
  }

  console.log(f);

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
