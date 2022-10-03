import { dataSource } from '~/orm/dbCreateConnection';
import AccessMenuRole from '~/orm/entities/AccessMenuRole';

const updateMenuRole = async (data: AccessMenuRole[]) => {
  const qR = await dataSource.createQueryRunner();

  await qR.connect();
  await qR.startTransaction();

  try {
    await qR.manager.delete(AccessMenuRole, { master_menu_id: data[0].master_menu_id });

    for (const amr of data) {
      await qR.manager.save(AccessMenuRole, amr);
    }

    await qR.commitTransaction();
    await qR.release();

    return { success: true, error: false };
  } catch (error) {
    await qR.rollbackTransaction();
    await qR.release();
    return { success: false, error };
  } finally {
    await qR.release();
  }
};

const menuRoleSvc = {
  updateMenuRole,
};

export default menuRoleSvc;
