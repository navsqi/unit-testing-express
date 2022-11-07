import micrositeDb from '~/orm/micrositeDb/index';

export const updateNoAplikasiLosMicrosite = async (noAplikasiLos: string, noPengajuan: string): Promise<string[]> => {
  try {
    const updateNoAplikasiLos = await micrositeDb.dataSource.query(
      `UPDATE hbl_pengajuan SET no_aplikasi_los = $1 WHERE no_pengajuan = $2`,
      [noAplikasiLos, noPengajuan],
    );

    return updateNoAplikasiLos;
  } catch (error) {
    return error;
  }
};

export const updateStatusLosMicrosite = async (statusLos: string, noPengajuan: string): Promise<string[]> => {
  try {
    const updateNoAplikasiLos = await micrositeDb.dataSource.query(
      `UPDATE hbl_pengajuan SET status_pengajuan = $1 WHERE no_pengajuan = $2`,
      [statusLos, noPengajuan],
    );

    return updateNoAplikasiLos;
  } catch (error) {
    return error;
  }
};

export default {
  updateNoAplikasiLosMicrosite,
  updateStatusLosMicrosite,
};
