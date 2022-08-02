import { Between } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import Mou from '~/orm/entities/Mou';

const mouRepo = dataSource.getRepository(Mou);

export const listMou = async (filter: any, paging: any): Promise<[Mou[], number]> => {
  const f: { [key: string]: any } = {};

  if (filter.status) {
    f['status'] = filter.status;
  }

  if (filter.start_date && filter.end_date) {
    f['created_at'] = Between(new Date(`${filter.start_date} 00:00:00`), new Date(`${filter.end_date} 00:00:00`));
  }

  const [mou, count] = await mouRepo.findAndCount({
    take: paging.limit,
    skip: paging.offset,
    where: f,
  });

  return [mou, count];
};
