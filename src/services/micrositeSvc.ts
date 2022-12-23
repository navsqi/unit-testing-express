import micrositeDb from '~/orm/micrositeDb/index';

interface IKlaimMO {
  noPengajuan: string;
  promoId: string;
  kodeVoucher: string;
}

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

export const klaimMo = async (params: IKlaimMO): Promise<string[]> => {
  try {
    const updateNoAplikasiLos = await micrositeDb.dataSource.query(
      `UPDATE hbl_pengajuan SET is_promo = TRUE, promo_id = $1, kode_voucher = $2 WHERE no_pengajuan = $3`,
      [params.promoId, params.kodeVoucher, params.noPengajuan],
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
