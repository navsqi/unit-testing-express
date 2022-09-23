/* eslint-disable @typescript-eslint/no-unused-vars */
import roleSvc from '~/services/roleSvc';

export default {
  setRole: async (kode_role?: string): Promise<string | null> => {
    // const namaRole = nama_role ? nama_role.toUpperCase() : null;
    const kodeRole = kode_role ? kode_role.toUpperCase() : null;
    const params = await roleSvc.listParamRoleSSO();
    let result = null;

    for (const param of params) {
      if (kodeRole && kodeRole.includes(param.prefix)) {
        result = param.mapping;
        break;
      }
    }

    return result;
  },
  setOutlet: (kode_outlet: string) => {
    const kodeOutlet = kode_outlet;

    if (kodeOutlet && kodeOutlet.startsWith('000')) {
      return '00002';
    }

    return kodeOutlet;
  },
};
