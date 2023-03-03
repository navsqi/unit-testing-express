import { Raw } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import EventHistory from '~/orm/entities/EventHistory';

const eventHistoryRepo = dataSource.getRepository(EventHistory);

interface IFilter {
  nik_user: string;
  event_type: string;
  action_type: string;
}

export const countLatestEventHistory = async (filter: IFilter) => {
  const data = await eventHistoryRepo.count({
    where: {
      nik_user: filter.nik_user,
      event_type: filter.event_type,
      action_type: filter.action_type,
      created_at: Raw((el) => `CAST(${el} AS DATE) = CURRENT_DATE`),
    },
  });

  return data;
};

export const createEventHistory = async (body: EventHistory) => {
  const data = await eventHistoryRepo.save(body);

  return data;
};
