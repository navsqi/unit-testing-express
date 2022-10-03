import { dataSource } from '~/orm/dbCreateConnection';
import ParamsSsoRole from '~/orm/entities/ParamsSsoRole';

const paramsSsoRoleRepo = dataSource.getRepository(ParamsSsoRole);

export const listParamRoleSSO = async () => {
  const dataParamsSsoRole = await paramsSsoRoleRepo.find();

  return dataParamsSsoRole;
};

export default {
  listParamRoleSSO,
};
