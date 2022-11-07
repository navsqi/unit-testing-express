import { NextFunction, Request, Response } from 'express';
import { FindOptionsWhere, ILike, In, IsNull, Not, Raw, Between } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import CustomError from '~/utils/customError';
import queryHelper from '~/utils/queryHelper';
import * as common from '~/utils/common';
import PkiAgunan from '~/orm/entities/PkiAgunan';
import PkiNasabah from '~/orm/entities/PkiNasabah';
import PkiPengajuan from '~/orm/entities/PkiPengajuan';

const pkiPengajuanRepo = dataSource.getRepository(PkiPengajuan);


export const getPki = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const where: FindOptionsWhere<PkiPengajuan> = {};
    const filter = {
      no_pengajuan: req.query.no_pengajuan as string,
      nama: req.query.nama as string,
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
      kode_produk: req.query.kode_produk as string,
      kode_instansi:req.query.kode_instansi,
      status_pengajuan:req.query.status_pengajuan,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 250,
      offset: null,
    };

    if(filter.no_pengajuan){
      where['no_pengajuan'] = ILike(`%${filter.no_pengajuan}%`);
    }
    if(filter.kode_produk){
      where['kode_produk'] = filter.kode_produk;
    }
    if(filter.kode_instansi){
      where['kode_instansi'] = +filter.kode_instansi;
    }

    if(filter.nama){
      where.pki_nasabah = {
        nama: ILike(`%${filter.nama}%`)
      };
    }

    if (filter.start_date && filter.end_date) {
      where['tgl_pengajuan'] = Between(new Date(`${filter.start_date} 00:00:00`), new Date(`${filter.end_date} 23:59:59`));
    }
    const paging = queryHelper.paging(req.query);

    const [pki, count] = await pkiPengajuanRepo.findAndCount({
      select:{
        pki_nasabah: {
          no_ktp: true,
          nama: true,
          tgl_lahir: true,
          no_hp: true,
          email: true,
          created_date: true,
          modified_date: true,
          file_path_ektp: true,
          data_consent: true,
        },
        pki_agunan:{
          no_pengajuan: true,
          jenis_agunan: true,
          jenis_kendaraan: true,
          kondisi_kendaraan: true,
          tahun_produksi: true,
          harga_kendaraan: true,
          uang_muka: true,
          merk_kendaraan: true,
          tipe_kendaraan: true,
          no_sertifikat: true,
          kepemilikan_agunan: true,
        },
        instansi:{
          id: true,
          nama_instansi: true,
          jenis_instansi: true,
        },
        produk:{
          kode_produk: true,
          nama_produk: true,
        }
      },
      relations:['pki_agunan','pki_nasabah','instansi','produk'],
      take: paging.limit,
      skip: paging.offset,
      where,
      order: {
        created_at: 'desc',
      },
    })
    const dataRes = {
      report: pki,
    };
    return res.customSuccess(200, 'Get P2KI', dataRes,{
      count: count,
      rowCount: paging.limit,
      limit: paging.limit,
      offset: paging.offset,
      page: Number(filter.page),
    });
  } catch (e){
    return next(e);
  }
}

export const createNewPki = async (req: Request, res: Response, next: NextFunction) => {
  const queryRunner = dataSource.createQueryRunner();

  queryRunner.connect();
  await queryRunner.startTransaction();
    try {
        const bodyPkiAgunan = req.body.pki_agunan as PkiAgunan;
        const pkiAgunan = new PkiAgunan()
        
        pkiAgunan.no_pengajuan = bodyPkiAgunan.no_pengajuan
        pkiAgunan.jenis_agunan = bodyPkiAgunan.jenis_agunan
        pkiAgunan.jenis_kendaraan = bodyPkiAgunan.jenis_kendaraan
        pkiAgunan.kondisi_kendaraan =  bodyPkiAgunan.kondisi_kendaraan
        pkiAgunan.tahun_produksi = bodyPkiAgunan.tahun_produksi
        pkiAgunan.harga_kendaraan = bodyPkiAgunan.harga_kendaraan
        pkiAgunan.uang_muka = bodyPkiAgunan.uang_muka
        pkiAgunan.merk_kendaraan = bodyPkiAgunan.merk_kendaraan
        pkiAgunan.tipe_kendaraan = bodyPkiAgunan.tipe_kendaraan
        pkiAgunan.no_sertifikat = bodyPkiAgunan.no_sertifikat 
        pkiAgunan.kepemilikan_agunan = bodyPkiAgunan.kepemilikan_agunan 
        
        const bodyPkiPengajuan = req.body.pki_pengajuan as PkiPengajuan;
        const pkiPengajuan = new PkiPengajuan()
      
        pkiPengajuan.no_pengajuan = bodyPkiPengajuan.no_pengajuan
        pkiPengajuan.no_ktp = bodyPkiPengajuan.no_ktp
        pkiPengajuan.kode_produk = bodyPkiPengajuan.kode_produk
        pkiPengajuan.tgl_pengajuan = bodyPkiPengajuan.tgl_pengajuan
        pkiPengajuan.kode_outlet = bodyPkiPengajuan.kode_outlet
        pkiPengajuan.jumlah_pinjaman = bodyPkiPengajuan.jumlah_pinjaman
        pkiPengajuan.angsuran = bodyPkiPengajuan.angsuran
        pkiPengajuan.total_uang_muka = bodyPkiPengajuan.total_uang_muka
        pkiPengajuan.status_pengajuan = bodyPkiPengajuan.status_pengajuan
        pkiPengajuan.created_date = bodyPkiPengajuan.created_date
        pkiPengajuan.modified_date = bodyPkiPengajuan.modified_date
        pkiPengajuan.kategori_pengajuan = bodyPkiPengajuan.kategori_pengajuan
        pkiPengajuan.kode_channel = bodyPkiPengajuan.kode_channel
        pkiPengajuan.tenor = bodyPkiPengajuan.tenor
        pkiPengajuan.status_usaha = bodyPkiPengajuan.status_usaha
        pkiPengajuan.uang_pokok = bodyPkiPengajuan.uang_pokok
        pkiPengajuan.sewa_modal = bodyPkiPengajuan.sewa_modal
        pkiPengajuan.tgl_expired = bodyPkiPengajuan.tgl_expired
        pkiPengajuan.no_aplikasi_los = bodyPkiPengajuan.no_aplikasi_los
        pkiPengajuan.kode_instansi = bodyPkiPengajuan.kode_instansi
        pkiPengajuan.response_los = bodyPkiPengajuan.response_los

        const bodyPkiNasabah = req.body.pki_nasabah as PkiNasabah;
        const pkiNasabah = new PkiNasabah()

        pkiNasabah.no_ktp = bodyPkiNasabah.no_ktp
        pkiNasabah.nama = bodyPkiNasabah.nama
        pkiNasabah.tgl_lahir = bodyPkiNasabah.tgl_lahir
        pkiNasabah.no_hp = bodyPkiNasabah.no_hp
        pkiNasabah.email = bodyPkiNasabah.email
        pkiNasabah.created_date = bodyPkiNasabah.created_date
        pkiNasabah.modified_date = bodyPkiNasabah.modified_date
        pkiNasabah.file_path_ektp = bodyPkiNasabah.file_path_ektp
        pkiNasabah.data_consent = bodyPkiNasabah.data_consent
        
        await queryRunner.manager.save(PkiAgunan,pkiAgunan)
        await queryRunner.manager.save(PkiPengajuan,pkiPengajuan)
        await queryRunner.manager.save(PkiNasabah,pkiNasabah)
      
          const dataRes = {
            pkiAgunan: pkiAgunan,
            pkiPengajuan: pkiPengajuan,
            pkiNasabah : pkiNasabah
          };
        await queryRunner.commitTransaction();
        await queryRunner.release();
        return res.customSuccess(200, 'Create pki success', dataRes);
      } catch (e) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        return next(e);
      }
}