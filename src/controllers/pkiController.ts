import { NextFunction, Request, Response } from 'express';
import { dataSource } from '~/orm/dbCreateConnection';
import PkiAgunan from '~/orm/entities/PkiAgunan';
import PkiNasabah from '~/orm/entities/PkiNasabah';
import PkiPengajuan from '~/orm/entities/PkiPengajuan';

export const createNewPki = async (req: Request, res: Response, next: NextFunction) => {
  const queryRunner = dataSource.createQueryRunner();

  queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const bodyPkiAgunan = req.body.pki_agunan as PkiAgunan;
    const pkiAgunan = new PkiAgunan();

    pkiAgunan.no_pengajuan = bodyPkiAgunan?.no_pengajuan;
    pkiAgunan.jenis_agunan = bodyPkiAgunan?.jenis_agunan;
    pkiAgunan.jenis_kendaraan = bodyPkiAgunan?.jenis_kendaraan;
    pkiAgunan.kondisi_kendaraan = bodyPkiAgunan?.kondisi_kendaraan;
    pkiAgunan.tahun_produksi = bodyPkiAgunan?.tahun_produksi;
    pkiAgunan.harga_kendaraan = bodyPkiAgunan?.harga_kendaraan;
    pkiAgunan.uang_muka = bodyPkiAgunan?.uang_muka;
    pkiAgunan.merk_kendaraan = bodyPkiAgunan?.merk_kendaraan;
    pkiAgunan.tipe_kendaraan = bodyPkiAgunan?.tipe_kendaraan;
    pkiAgunan.no_sertifikat = bodyPkiAgunan?.no_sertifikat;
    pkiAgunan.kepemilikan_agunan = bodyPkiAgunan?.kepemilikan_agunan;

    const bodyPkiPengajuan = req.body.pki_pengajuan as PkiPengajuan;
    const pkiPengajuan = new PkiPengajuan();

    pkiPengajuan.no_pengajuan = bodyPkiPengajuan?.no_pengajuan;
    pkiPengajuan.no_ktp = bodyPkiPengajuan?.no_ktp;
    pkiPengajuan.kode_produk = bodyPkiPengajuan?.kode_produk;
    pkiPengajuan.tgl_pengajuan = bodyPkiPengajuan?.tgl_pengajuan;
    pkiPengajuan.kode_outlet = bodyPkiPengajuan?.kode_outlet;
    pkiPengajuan.jumlah_pinjaman = bodyPkiPengajuan?.jumlah_pinjaman;
    pkiPengajuan.angsuran = bodyPkiPengajuan?.angsuran;
    pkiPengajuan.total_uang_muka = bodyPkiPengajuan?.total_uang_muka;
    pkiPengajuan.status_pengajuan = bodyPkiPengajuan?.status_pengajuan;
    pkiPengajuan.created_date = bodyPkiPengajuan?.created_date;
    pkiPengajuan.modified_date = bodyPkiPengajuan?.modified_date;
    pkiPengajuan.kategori_pengajuan = bodyPkiPengajuan?.kategori_pengajuan;
    pkiPengajuan.kode_channel = bodyPkiPengajuan?.kode_channel;
    pkiPengajuan.tenor = bodyPkiPengajuan?.tenor;
    pkiPengajuan.status_usaha = bodyPkiPengajuan?.status_usaha;
    pkiPengajuan.uang_pokok = bodyPkiPengajuan?.uang_pokok;
    pkiPengajuan.sewa_modal = bodyPkiPengajuan?.sewa_modal;
    pkiPengajuan.tgl_expired = bodyPkiPengajuan?.tgl_expired;
    pkiPengajuan.no_aplikasi_los = bodyPkiPengajuan?.no_aplikasi_los;
    pkiPengajuan.kode_instansi = bodyPkiPengajuan?.kode_instansi;
    pkiPengajuan.response_los = bodyPkiPengajuan?.response_los;

    const bodyPkiNasabah = req.body.pki_nasabah as PkiNasabah;
    const pkiNasabah = new PkiNasabah();

    pkiNasabah.no_ktp = bodyPkiNasabah?.no_ktp;
    pkiNasabah.nama = bodyPkiNasabah?.nama;
    pkiNasabah.tgl_lahir = bodyPkiNasabah?.tgl_lahir;
    pkiNasabah.no_hp = bodyPkiNasabah?.no_hp;
    pkiNasabah.email = bodyPkiNasabah?.email;
    pkiNasabah.created_date = bodyPkiNasabah?.created_date;
    pkiNasabah.modified_date = bodyPkiNasabah?.modified_date;
    pkiNasabah.file_path_ektp = bodyPkiNasabah?.file_path_ektp;
    pkiNasabah.data_consent = bodyPkiNasabah?.data_consent;

    await queryRunner.manager.save(PkiAgunan, pkiAgunan);
    await queryRunner.manager.save(PkiPengajuan, pkiPengajuan);
    await queryRunner.manager.save(PkiNasabah, pkiNasabah);

    const dataRes = {
      pkiAgunan: pkiAgunan,
      pkiPengajuan: pkiPengajuan,
      pkiNasabah: pkiNasabah,
    };
    await queryRunner.commitTransaction();
    await queryRunner.release();

    return res.customSuccess(200, 'Create pki success', dataRes);
  } catch (e) {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
    return next(e);
  }
};
