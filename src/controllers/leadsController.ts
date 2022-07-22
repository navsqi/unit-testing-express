import { NextFunction, Request, Response } from 'express';
import { FindOptionsWhere, ILike } from 'typeorm';
import APIPegadaian from '~/apis/pegadaianApi';
import Leads from '~/orm/entities/Leads';
import CustomError from '~/utils/customError';
import queryHelper from '~/utils/queryHelper';

import { parse } from 'csv-parse';
import { dataSource } from '~/orm/dbCreateConnection';
import NasabahPerorangan from '~/orm/entities/NasabahPerorangan';
import { IKTPPassion } from '~/types/APIPegadaianTypes';
import { addDays, bufferToStream, parseIp } from '~/utils/common';
import validationCsv from '~/utils/validationCsv';

const leadsRepo = dataSource.getRepository(Leads);
const nasabahPeroranganRepo = dataSource.getRepository(NasabahPerorangan);

export const getLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where: FindOptionsWhere<Leads> = {};

    const filter = {
      nama: req.query.nama,
      status: req.query.status,
    };

    if (filter.nama) {
      where['nama'] = ILike(`%${filter.nama}%`);
    }

    if (filter.status) {
      where['status'] = +filter.status;
    }

    const paging = queryHelper.paging(req.query);

    const [leads, count] = await leadsRepo.findAndCount({
      relations: ['instansi', 'event', 'outlet'],
      take: paging.limit,
      skip: paging.offset,
      where,
    });

    const dataRes = {
      meta: {
        count,
        limit: paging.limit,
        offset: paging.offset,
      },
      leads,
    };

    return res.customSuccess(200, 'Get leads', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getLeadsById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leads = await leadsRepo.findOne({
      relations: ['instansi', 'event', 'outlet'],
      where: {
        id: +req.params.leadsId,
      },
    });

    const dataRes = {
      leads,
    };

    return res.customSuccess(200, 'Get leads', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const updateLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instansi = await leadsRepo.update(req.params.id, {
      ...req.body,
      updated_by: req.user.nik,
    });

    const dataRes = {
      instansi: instansi,
    };

    return res.customSuccess(200, 'Update leads success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getKtpByInstansiId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where: FindOptionsWhere<Leads> = {};

    const filter = {
      nama: req.query.nama,
    };

    if (filter.nama) {
      where['nama'] = ILike(`%${filter.nama}%`);
    }

    const paging = queryHelper.paging(req.query);

    const [leads, count] = await leadsRepo.findAndCount({
      select: ['nik_ktp', 'nama'],
      take: paging.limit,
      skip: paging.offset,
      where,
    });

    const dataRes = {
      meta: {
        count,
        limit: paging.limit,
        offset: paging.offset,
      },
      leads,
    };

    return res.customSuccess(200, 'Get leads', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const createNewLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodies = req.body as Leads;

    const getExistingLeads = await leadsRepo.findOne({
      where: { nik_ktp: bodies.nik_ktp, kode_produk: bodies.kode_produk, step: 'CLP' },
      relations: ['user_created'],
    });

    if (!bodies.is_ktp_valid) return next(new CustomError('NIK KTP harus valid', 400));

    if (getExistingLeads) {
      return next(
        new CustomError(
          `NIK ${getExistingLeads.nik_ktp} dengan kode produk ${bodies.kode_produk} sedang diprospek oleh ${getExistingLeads.user_created.nik}`,
          400,
        ),
      );
    }

    if (!bodies.cif && !bodies.nik_ktp) {
      return next(new CustomError('CIF atau NIK wajib di-isi', 400));
    }

    if (!bodies.nik_ktp_karyawan) {
      bodies.is_karyawan = 1;
    }

    const leads = await leadsRepo.save({
      ...req.body,
      kode_unit_kerja: req.user.kode_unit_kerja,
      created_by: req.user.nik,
      updated_by: req.user.nik,
      source_data: 'FORM INPUT DATA',
      expired_referral: addDays(30),
    });

    const dataRes = {
      leads: leads,
    };

    return res.customSuccess(200, 'Create leads success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const createNewLeadsByCsv = async (req: Request, res: Response, next: NextFunction) => {
  const queryRunner = dataSource.createQueryRunner();

  queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const bodies = req.body as Leads;

    let csv: Express.Multer.File = null;

    if (req.files && req.files['csv']) {
      csv = req.files['csv'][0];
    }

    const dataInput: Leads[] = [];
    let validate = [];

    bufferToStream(csv.buffer)
      .pipe(parse({ delimiter: ',', from_line: 2 }))
      .on('data', async (row) => {
        const leads = new Leads();

        leads.instansi_id = +bodies.instansi_id;
        leads.event_id = +bodies.event_id;
        leads.nik_ktp = row[0];
        leads.nama = row[1].toUpperCase();
        leads.no_hp = row[2];
        leads.up = +row[3];
        leads.kode_produk = row[4];
        leads.nik_ktp_karyawan = row[5] ? row[5] : null;
        leads.created_by = req.user.nik;
        leads.kode_unit_kerja = req.user.kode_unit_kerja;
        leads.source_data = 'BULK CSV';
        leads.expired_referral = addDays(30);

        dataInput.push(leads);
      })
      .on('end', async () => {
        for (const [index, data] of dataInput.entries()) {
          validate = validationCsv({
            nama: data.nama,
            nik_ktp: data.nik_ktp,
            no_hp: data.no_hp,
            kode_produk: data.kode_produk,
          });

          if (validate.length > 0) {
            validate.unshift(`Data pada baris ke - ${index + 1} terdapat kesalahan`);
            break;
          }

          const checkExistingLeads = await queryRunner.manager.findOne(Leads, {
            where: {
              nik_ktp: data.nik_ktp,
              kode_produk: data.kode_produk,
              step: 'CLP',
            },
          });

          if (!checkExistingLeads) {
            await queryRunner.manager.save(Leads, data);
          }
        }

        if (validate.length > 0) {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();
          return next(new CustomError(JSON.stringify(validate), 400));
        }

        const dataRes = {
          leads: true,
        };

        await queryRunner.commitTransaction();
        await queryRunner.release();

        return res.customSuccess(200, 'Create leads success', dataRes);
      })
      .on('error', (error) => {
        return next(error);
      });
  } catch (e) {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();

    return next(e);
  }
};

export const checkNasabahPeroranganByNikDukcapil = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodies = req.body;

    const getIp = parseIp(req);

    const checkToNasabahPerorangan = await nasabahPeroranganRepo.findOne({
      where: { nik: bodies.nik, nama: bodies.nama.toUpperCase() },
    });

    if (checkToNasabahPerorangan) {
      const dataRes = {
        isNikValid: true,
        ktp: checkToNasabahPerorangan,
      };

      return res.customSuccess(200, 'Check data KTP success', dataRes);
    }

    const checkKTP = await APIPegadaian.checkEktpDukcapil({
      nama: bodies.nama,
      nik: bodies.nik,
      ipUser: getIp,
    });

    if (checkKTP.status !== 200) throw new Error(checkKTP.data.toString());

    const ktpData = checkKTP?.data?.data;

    if (!ktpData) return next(new CustomError('Data NIK EKTP tidak ditemukan', 404));

    if (ktpData.namaLengkap.toUpperCase().includes('TIDAK'))
      return next(new CustomError('Data NIK EKTP Tidak Valid', 400));

    const data = await nasabahPeroranganRepo.save({
      nik: bodies.nik,
      nama: bodies.nama.toUpperCase(),
      created_by: req.user.nik,
      source_data: 'DUKCAPIL',
    });

    const dataRes = {
      isNikValid: true,
      ktp: data,
    };

    return res.customSuccess(200, 'Check data KTP success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const checkNasabahPeroranganByNikPassion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodies = req.body;

    let isNewCif = true;
    let isKTPValid = false;

    const checkToNasabahPerorangan = await nasabahPeroranganRepo.findOne({ where: { nik: bodies.nik } });

    if (checkToNasabahPerorangan) {
      const dataRes = {
        isNewCif: false,
        isKTPValid: true,
        nasabah: checkToNasabahPerorangan,
      };

      return res.customSuccess(200, 'Check data KTP success', dataRes);
    }

    let checkKTP = await APIPegadaian.getNasabahByIdKtpPassion({
      nik: bodies.nik,
      flag: 'K',
    });

    if (checkKTP.status !== 200) throw new Error(checkKTP.data.toString());

    let ktpData = checkKTP?.data?.data;

    if (!ktpData) {
      checkKTP = await APIPegadaian.getNasabahByIdKtpPassion({
        nik: bodies.nik,
        flag: 'S',
      });

      if (checkKTP.status !== 200) throw new Error(checkKTP.data.toString());

      ktpData = checkKTP?.data?.data;
    }

    let nasabah: any = null;
    if (ktpData) {
      isNewCif = false;
      isKTPValid = true;

      ktpData = JSON.parse(ktpData)[0];

      const data: IKTPPassion = ktpData;

      nasabah = await nasabahPeroranganRepo.save({
        nik: data.noIdentitas,
        cif: data.cif,
        nama: data.namaNasabah,
        created_by: req.user.nik,
        source_data: 'PASSION',
      });
    }

    const dataRes = {
      isNewCif,
      isKTPValid,
      nasabah,
    };

    return res.customSuccess(200, 'Check data KTP success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getNasabahByCif = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodies = req.body;

    const checkToNasabahPerorangan = await nasabahPeroranganRepo.findOne({ where: { nik: bodies.nik } });

    if (checkToNasabahPerorangan) {
      const dataRes = {
        isCifValid: true,
        ktp: checkToNasabahPerorangan,
      };

      return res.customSuccess(200, 'Check data KTP success', dataRes);
    }

    const nasabahReq = await APIPegadaian.getNasabahByCif({
      cif: bodies.cif,
    });
    getNasabahByCif;
    if (nasabahReq.status !== 200) throw new Error(nasabahReq.data.toString());

    const nasabah = JSON.parse(nasabahReq.data.data);

    if (!nasabah) return next(new CustomError(`Data CIF tidak ditemukan`, 404));

    const dataRes = {
      isCifValid: true,
      nasabah,
    };

    return res.customSuccess(200, 'Get nasabah by cif', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const checkBadanUsahaByCif = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodies = req.body;

    const badanUsahaReq = await APIPegadaian.getBadanUsahaByCif({
      cif: bodies.cif,
      flag: bodies.flag,
    });

    if (badanUsahaReq.status !== 200) throw new Error(badanUsahaReq.data.toString());

    const badanUsaha = JSON.parse(badanUsahaReq.data.data);

    const dataRes = {
      badanUsaha,
    };

    return res.customSuccess(200, 'Get badan usaha', dataRes);
  } catch (e) {
    return next(e);
  }
};
