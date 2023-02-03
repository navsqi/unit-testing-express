import { NextFunction, Request, Response } from 'express';
import { Between, FindOptionsWhere, ILike } from 'typeorm';
import APIPegadaian from '~/apis/pegadaianApi';
import { dataSource } from '~/orm/dbCreateConnection';
import MasterStatusLos from '~/orm/entities/MasterStatusLos';
import PkiAgunan from '~/orm/entities/PkiAgunan';
import PkiNasabah from '~/orm/entities/PkiNasabah';
import PkiPengajuan from '~/orm/entities/PkiPengajuan';
import micrositeSvc from '~/services/micrositeSvc';
import { p2kiReport } from '~/services/reportSvc';
import { ILOSHistoryKreditResponse, ILOSPengajuan, ILOSPengajuanResponse } from '~/types/LOSTypes';
import * as common from '~/utils/common';
import CustomError from '~/utils/customError';
import mappingLosResponse from '~/utils/mappingLosResponse';
import queryHelper from '~/utils/queryHelper';
import xls from '~/utils/xls';

const pkiPengajuanRepo = dataSource.getRepository(PkiPengajuan);
const statusLosRepo = dataSource.getRepository(MasterStatusLos);

export const getStatusLos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statusLos = await statusLosRepo.find();

    const dataRes = {
      statusLos,
    };

    return res.customSuccess(200, 'Get status los', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getPki = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where: FindOptionsWhere<PkiPengajuan> = {};
    const kodeOutlet = req.user.kode_unit_kerja;

    const filter = {
      no_pengajuan: req.query.no_pengajuan as string,
      nama: req.query.nama as string,
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
      kode_produk: req.query.kode_produk as string,
      kode_instansi: req.query.kode_instansi,
      status_pengajuan: req.query.status_pengajuan,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 250,
      offset: null,
      kode_outlet: kodeOutlet.startsWith('0000') ? null : kodeOutlet,
      is_promo: Number(req.query.is_promo) || '',
    };

    if (filter.is_promo === 1) {
      where['is_promo'] = true;
    }

    if (filter.is_promo === 0) {
      where['is_promo'] = false;
    }

    if (filter.no_pengajuan) {
      where['no_pengajuan'] = ILike(`%${filter.no_pengajuan}%`);
    }
    if (filter.kode_produk) {
      where['kode_produk'] = filter.kode_produk;
    }
    if (filter.kode_instansi) {
      where['kode_instansi'] = +filter.kode_instansi;
    }

    if (filter.nama) {
      where.pki_nasabah = {
        nama: ILike(`%${filter.nama}%`),
      };
    }

    if (filter.start_date && filter.end_date) {
      where['tgl_pengajuan'] = Between(
        new Date(`${filter.start_date} 00:00:00`),
        new Date(`${filter.end_date} 23:59:59`),
      );
    }
    const paging = queryHelper.paging(req.query);

    const [pki, count] = await pkiPengajuanRepo.findAndCount({
      select: {
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
          jenis_pekerjaan: true,
          pengeluaran: true,
          penghasilan: true,
          status_perkawinan: true,
        },
        pki_agunan: {
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
        instansi: {
          id: true,
          nama_instansi: true,
          jenis_instansi: true,
        },
        produk: {
          kode_produk: true,
          nama_produk: true,
        },
        outlet: {
          nama: true,
        },
        promo_microsite: {
          nama_promosi: true,
        },
        promo: {
          nama_promosi: true,
        },
      },
      relations: {
        pki_agunan: true,
        pki_nasabah: true,
        instansi: true,
        produk: true,
        outlet: true,
        promo_microsite: true,
        promo: true,
      },
      take: paging.limit,
      skip: paging.offset,
      where,
      order: {
        created_at: 'desc',
      },
    });

    const dataRes = {
      report: pki,
    };

    return res.customSuccess(200, 'Get P2KI', dataRes, {
      count: count,
      rowCount: paging.limit,
      limit: paging.limit,
      offset: paging.offset,
      page: Number(filter.page),
    });
  } catch (e) {
    return next(e);
  }
};

export const createNewPki = async (req: Request, res: Response, next: NextFunction) => {
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();
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
    pkiPengajuan.body_los = bodyPkiPengajuan?.body_los;

    pkiPengajuan.is_promo = bodyPkiPengajuan?.is_promo ? true : false;
    pkiPengajuan.promo_id = bodyPkiPengajuan?.promo_id ? bodyPkiPengajuan.promo_id : null;
    pkiPengajuan.promomicrosite_id = bodyPkiPengajuan?.promomicrosite_id ? bodyPkiPengajuan.promomicrosite_id : null;
    pkiPengajuan.kode_voucher = bodyPkiPengajuan?.kode_voucher ? bodyPkiPengajuan.kode_voucher : null;

    const cekIdPengajuan = await queryRunner.manager.findOne(PkiPengajuan, {
      where: { no_pengajuan: pkiPengajuan.no_pengajuan },
    });

    if (cekIdPengajuan) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return next(new CustomError('No Pengajuan telah ada', 400));
    }

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

    pkiNasabah.jenis_pekerjaan = bodyPkiNasabah?.jenis_pekerjaan;
    pkiNasabah.status_pekerjaan = bodyPkiNasabah?.status_pekerjaan;
    pkiNasabah.masa_kerja = bodyPkiNasabah?.masa_kerja;
    pkiNasabah.jumlah_tanggungan = bodyPkiNasabah?.jumlah_tanggungan;
    pkiNasabah.penghasilan = bodyPkiNasabah?.penghasilan;
    pkiNasabah.pengeluaran = bodyPkiNasabah?.pengeluaran;
    pkiNasabah.status_perkawinan = bodyPkiNasabah?.status_perkawinan;

    const cekNoKtp = await queryRunner.manager.findOne(PkiNasabah, {
      where: { no_ktp: pkiNasabah.no_ktp },
    });

    if (!cekNoKtp) {
      await queryRunner.manager.save(PkiNasabah, pkiNasabah);
    }

    await queryRunner.manager.save(PkiAgunan, pkiAgunan);
    await queryRunner.manager.save(PkiPengajuan, pkiPengajuan);

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

export const sendPengajuanToLos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const noPengajuan = req.body.no_pengajuan as string;
    const pkiPengajuan = await pkiPengajuanRepo.findOne({ where: { no_pengajuan: noPengajuan } });

    if (!noPengajuan || !pkiPengajuan) return next(new CustomError('Nomor pengajuan tidak ditemukan', 404));

    const payloadLOS = JSON.parse(pkiPengajuan.body_los) as ILOSPengajuan;

    const pengajuanLOS = await APIPegadaian.losPengajuanKredit(payloadLOS);

    if (pengajuanLOS.status != 200) return next(new CustomError('Pengajuan ke LOS gagal', 400));

    const dataPengajuanLOS = pengajuanLOS?.data;

    if (dataPengajuanLOS.responseCode != '00') return next(new CustomError(dataPengajuanLOS.responseDesc, 400));

    const lesResponse: ILOSPengajuanResponse = JSON.parse(dataPengajuanLOS.data);

    // update no aplikasi los ke db kamila
    await pkiPengajuanRepo.update(
      { no_pengajuan: noPengajuan },
      { no_aplikasi_los: lesResponse.noAplikasiLos, updated_by: req.user.nik },
    );
    // update no aplikasi los ke db microsite
    await micrositeSvc.updateNoAplikasiLosMicrosite(lesResponse.noAplikasiLos, pkiPengajuan.no_pengajuan);

    const dataRes = {
      los: lesResponse,
    };

    return res.customSuccess(200, 'Pengajuan kredit ke LOS berhasil', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const historyKreditLos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const noPengajuan = req.body.no_pengajuan as string;
    const pkiPengajuan = await pkiPengajuanRepo.findOne({ where: { no_pengajuan: noPengajuan } });

    if (!noPengajuan || !pkiPengajuan) return next(new CustomError('Nomor pengajuan tidak ditemukan', 404));

    if (!pkiPengajuan.no_aplikasi_los) return next(new CustomError('Nomor aplikasi LOS belum ada', 404));

    const pengajuanLOS = await APIPegadaian.losHistoryKredit(pkiPengajuan.no_aplikasi_los);

    if (pengajuanLOS.status != 200) return next(new CustomError('Pengajuan ke LOS gagal', 400));

    const dataPengajuanLOS = pengajuanLOS?.data;

    if (dataPengajuanLOS.responseCode != '00') return next(new CustomError(dataPengajuanLOS.responseDesc, 400));

    const parseResponseHistoryKredit = JSON.parse(dataPengajuanLOS.data) as ILOSHistoryKreditResponse;

    const mappingResponse = mappingLosResponse.mappingHistoryKredit(parseResponseHistoryKredit);

    if (mappingResponse && mappingResponse.length > 0) {
      const newStatus = mappingResponse[0];

      const statusLos = newStatus.status_microsite;

      if (statusLos) {
        await pkiPengajuanRepo.update(
          { no_pengajuan: noPengajuan },
          { status_pengajuan: newStatus.status_microsite.id_status_microsite, updated_by: req.user.nik },
        );

        await micrositeSvc.updateStatusLosMicrosite(newStatus.status_microsite.id_status_microsite, noPengajuan);
      }
    }

    const dataRes = {
      los: mappingResponse,
    };

    return res.customSuccess(200, 'Get history kredit LOS berhasil', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getReportPki = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const kodeOutlet = req.user.kode_unit_kerja;

    const filter = {
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
      nama: (req.query.nama as string) || '',
      no_pengajuan: (req.query.no_pengajuan as string) || '',
      kode_produk: (req.query.kode_produk as string) || '',
      instansi_id: (req.query.instansi_id as string) || '',
      kode_status_pengajuan: (req.query.kode_status_pengajuan as string) || '',
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 250,
      offset: null,
      kode_outlet: kodeOutlet.startsWith('0000') ? null : kodeOutlet,
    };

    const paging = queryHelper.paging({ ...filter });
    filter.offset = paging.offset;
    filter.limit = paging.limit;

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const report = await p2kiReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const dataRes = {
      report: report.data,
    };

    return res.customSuccess(200, 'Get P2KI', dataRes, {
      count: report.count,
      rowCount: null,
      limit: paging.limit,
      offset: paging.offset,
      page: Number(req.query.page),
    });
  } catch (e) {
    return next(e);
  }
};

export const genExcelReportPki = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = {
      start_date: (req.query.start_date as string) || '',
      end_date: (req.query.end_date as string) || '',
      nama: (req.query.nama as string) || '',
      no_pengajuan: (req.query.no_pengajuan as string) || '',
      kode_produk: (req.query.kode_produk as string) || '',
      instansi_id: (req.query.instansi_id as string) || '',
      status_pengajuan: (req.query.status_pengajuan as string) || '',
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 250,
      offset: null,
    };

    const paging = queryHelper.paging({ ...filter });
    filter.offset = paging.offset;
    filter.limit = paging.limit;

    if (!filter.start_date || !filter.end_date) return next(new CustomError('Pilih tanggal awal dan akhir', 400));

    const report = await p2kiReport(filter);

    if (report.err) return next(new CustomError(report.err, 400));

    const data = report.data;

    const { workbook, worksheet, headingStyle, outlineHeadingStyle, outlineStyle } = xls();

    const col = 16;

    worksheet.column(1).setWidth(5);
    for (let i = 2; i <= col; i++) {
      const exclude = [];
      worksheet.column(i).setWidth(exclude.includes(i) ? 10 : 25);
    }

    worksheet.cell(1, 1, 1, 9, true).string('REPORT MICROSITE P2KI').style(headingStyle);
    worksheet
      .cell(2, 1, 2, 9, true)
      .string(
        `TANGGAL ${common.tanggal(req.query.start_date as string)} S.D. ${common.tanggal(
          req.query.end_date as string,
        )}`,
      )
      .style(headingStyle);

    const barisHeading = 5;
    let noHeading = 0;

    const judulKolom = [
      'NO',
      'NOMOR PENGAJUAN / KODE BOOKING',
      'NAMA PRODUK',
      'NAMA NASABAH',
      'NO HP',
      'INSTANSI',
      'UNIT KERJA INSTANSI',
      'TANGGAL PENGAJUAN',
      'UANG PINJAMAN',
      'AGUNAN',
      'OUTLET PENGAJUAN',
      'AREA PENGAJUAN',
      'STATUS',
    ];

    for (const header of judulKolom) {
      worksheet
        .cell(barisHeading, ++noHeading)
        .string(header)
        .style(outlineHeadingStyle);
    }

    let rows = 6;

    const valueKolom = [
      { property: 'no_pengajuan', isMoney: false, isDate: false },
      { property: 'nama_produk', isMoney: false, isDate: false },
      { property: 'nama_nasabah', isMoney: false, isDate: false },
      { property: 'no_hp', isMoney: false, isDate: false },
      { property: 'nama_instansi', isMoney: false, isDate: false },
      { property: 'unit_kerja_instansi', isMoney: false, isDate: false },
      { property: 'tgl_pengajuan', isMoney: false, isDate: true },
      { property: 'jumlah_pinjaman', isMoney: false, isDate: false },
      { property: 'mra_full', isMoney: false, isDate: false },
      { property: 'outlet_pengajuan_full', isMoney: false, isDate: false },
      { property: 'area_pengajuan', isMoney: false, isDate: false },
      { property: 'status_pengajuan_full', isMoney: false, isDate: false },
    ];

    for (const [index, val] of data.entries()) {
      let bodyLineNum = 1;
      worksheet
        .cell(rows, 1)
        .string(`${index + 1}`)
        .style(outlineStyle);

      for (const col of valueKolom) {
        let data = String(val[col.property]);

        if (col.isDate) {
          data = common.tanggal(val[col.property]);
        }

        if (col.isMoney) {
          data = common.rupiah(+val[col.property], false);
        }

        worksheet
          .cell(rows, ++bodyLineNum)
          .string(data && data != 'null' ? data : '-')
          .style(outlineStyle);
      }

      rows++;
    }

    const fileBuffer = await workbook.writeToBuffer();

    res.set({
      'Content-Disposition': `attachment; filename="REPORTP2KIMICROSITE-${Date.now()}.xlsx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    return res.end(fileBuffer);
  } catch (e) {
    next(e);
  }
};
