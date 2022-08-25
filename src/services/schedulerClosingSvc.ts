import { EntityManager, SelectQueryBuilder } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';

export const leadsReport = async () => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  const manager = queryRunner.manager;

  try {
    const q = manager.createQueryBuilder();

    const data = await q.getRawMany();

    await queryRunner.commitTransaction();
    await queryRunner.release();

    return {
      err: false,
      data,
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();

    return { err: error.message, data: null };
  }
};

const queryA = async (manager: EntityManager) => {
  return true;
};
