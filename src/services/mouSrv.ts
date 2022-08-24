import { Between, ILike, In } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import Mou from '~/orm/entities/Mou';

const mouRepo = dataSource.getRepository(Mou);

export const listMou = async (filter: any, paging: any): Promise<[Mou[], number]> => {
  const f: { [key: string]: any } = {};

  if (filter.status) {
    f['status'] = filter.status;
  }

  if (filter.nomor_kerjasama) {
    f['nomor_kerjasama'] = ILike(`%${filter.nomor_kerjasama}%`);
  }

  if (filter.nama_kerjasama) {
    f['nama_kerjasama'] = ILike(`%${filter.nama_kerjasama}%`);
  }

  if (filter.start_date && filter.end_date) {
    f['created_at'] = Between(new Date(`${filter.start_date} 00:00:00`), new Date(`${filter.end_date} 23:59:59`));
  }

  if (filter.outlet_id && filter.outlet_id.length > 0) {
    f['kode_unit_kerja'] = In(filter.outlet_id);
  }

  const [mou, count] = await mouRepo.findAndCount({
    take: paging.limit,
    skip: paging.offset,
    where: f,
  });

  return [mou, count];
};
