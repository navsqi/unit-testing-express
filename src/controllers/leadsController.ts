import { NextFunction, Request, Response } from 'express';
import { FindOptionsOrder, FindOptionsWhere, ILike, In, IsNull, Raw } from 'typeorm';
import APIPegadaian from '~/apis/pegadaianApi';
import Leads from '~/orm/entities/Leads';
import * as common from '~/utils/common';
import CustomError from '~/utils/customError';
import queryHelper from '~/utils/queryHelper';

import { parse } from 'csv-parse';
import dayjs from 'dayjs';
import { IResponseBadanUsaha } from '~/interfaces/IApiPegadaian';
import { dataSource } from '~/orm/dbCreateConnection';
import Event from '~/orm/entities/Event';
import NasabahBadanUsaha from '~/orm/entities/NasabahBadanUsaha';
import NasabahPerorangan from '~/orm/entities/NasabahPerorangan';
import { konsolidasiTopBottom } from '~/services/konsolidasiSvc';
import { IKTPPassion } from '~/types/APIPegadaianTypes';
import { addDays, bufferToStream, parseIp } from '~/utils/common';
import validationCsv from '~/utils/validationCsv';

const leadsRepo = dataSource.getRepository(Leads);
const eventRepo = dataSource.getRepository(Event);
const nasabahPeroranganRepo = dataSource.getRepository(NasabahPerorangan);
const nasabahBadanUsahaRepo = dataSource.getRepository(NasabahBadanUsaha);

export const getLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where: FindOptionsWhere<Leads> = {};

    const filter = {
      nama: req.query.nama,
      status: req.query.status,
      kode_unit_kerja: req.query.kode_unit_kerja,
      is_session: req.query.is_session ? +req.query.is_session : null,
      is_badan_usaha: req.query.is_badan_usaha ? +req.query.is_badan_usaha : null,
      instansi_id: req.query.instansi_id,
      event_id: req.query.event_id,
      pic_selena: req.query.pic_selena as string,
      follow_up_pic_selena: +req.query.follow_up_pic_selena as number,
      order_by: req.query.order_by as string,
    };

    if (common.isSalesRole(req.user.kode_role)) {
      filter.is_session = 1;
    }

    if (filter.nama) {
      where['nama'] = ILike(`%${filter.nama}%`);
    }

    if (filter.status) {
      where['status'] = +filter.status;
    }

    if (filter.instansi_id) {
      where['instansi_id'] = +filter.instansi_id;
    }

    if (filter.event_id) {
      where['event_id'] = +filter.event_id;
    }

    // FILTER KHUSUS SELENA FRONTING
    if (filter.pic_selena) {
      where['pic_selena'] = filter.pic_selena;
    }

    if (filter.follow_up_pic_selena) {
      if (filter.follow_up_pic_selena == 1) {
        where['pic_selena'] = Raw((alias) => `${alias} is not null or ${alias} <> ''`);
      } else {
        where['pic_selena'] = IsNull();
      }
    }
    // END OF FILTER KHUSUS SELENA FRONTING

    if (filter.kode_unit_kerja && filter.is_session == 0) {
      const outletId = (req.query.kode_unit_kerja || req.user.kode_unit_kerja) as string;
      let outletIds = [];

      if (!outletId.startsWith('000')) {
        outletIds = await konsolidasiTopBottom(outletId as string);
      }

      where['kode_unit_kerja'] = outletIds.length > 0 ? In(outletIds) : undefined;
    }

    if (filter.is_session == 1) {
      where['created_by'] = req.user.nik;
    }

    if (filter.is_badan_usaha != null) {
      where['is_badan_usaha'] = filter.is_badan_usaha;
    }

    // order
    // The null value sorts higher than any other value.
    // with ascending sort order ==> null values sort at the end,
    // with descending sort order ==> null values sort at the beginning.
    let order: FindOptionsOrder<Leads> = {
      created_at: 'desc',
    };

    if (filter.order_by && filter.order_by.includes('pic_selena:')) {
      const orderSplit = filter.order_by.split(':');
      const orderType = orderSplit[1] as any;

      order = {
        pic_selena: orderType,
        updated_at_selena: orderType,
      };
    }
    // end of order

    const paging = queryHelper.paging(req.query);

    const [leads, count] = await leadsRepo.findAndCount({
      select: {
        instansi: {
          id: true,
          nama_instansi: true,
        },
        event: {
          id: true,
          nama_event: true,
          nama_pic: true,
          tanggal_event: true,
        },
        outlet: {
          kode: true,
          unit_kerja: true,
          nama: true,
        },
        produk: {
          kode_produk: true,
          nama_produk: true,
        },
      },
      relations: ['instansi', 'event', 'outlet', 'produk'],
      take: paging.limit,
      skip: paging.offset,
      where,
      order: order,
    });

    const dataRes = {
      meta: {
        count,
        limit: paging.limit,
        offset: paging.offset,
      },
      leads,
    };

    return res.customSuccess(200, 'Get leads', dataRes, {
      count: count,
      rowCount: paging.limit,
      limit: paging.limit,
      offset: paging.offset,
      page: Number(req.query.page),
    });
  } catch (e) {
    return next(e);
  }
};

export const getLeadsById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leads = await leadsRepo.findOne({
      select: {
        instansi: {
          id: true,
          nama_instansi: true,
        },
        event: {
          id: true,
          nama_event: true,
          nama_pic: true,
          tanggal_event: true,
        },
        outlet: {
          kode: true,
          unit_kerja: true,
          nama: true,
        },
        produk: {
          kode_produk: true,
          nama_produk: true,
        },
      },
      relations: ['instansi', 'event', 'outlet', 'produk'],
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

export const getLeadsByNik = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nikKtp = req.params.nikKtp;

    if (!nikKtp || nikKtp.length != 16) return next(new CustomError('NIK harus 16 digit angka', 400));

    const leads = await leadsRepo.findOne({
      relations: ['instansi', 'event', 'outlet'],
      where: {
        nik_ktp: nikKtp,
      },
    });

    if (!leads)
      return next(
        new CustomError(
          'Maaf anda belum dapat terdaftar. Silahkan menghubungi PIC Marketing kami pada Instansi Anda',
          404,
        ),
      );

    const dataRes = {
      leads,
    };

    return res.customSuccess(200, 'Get leads', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getLeadsInstansiByNik = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nikKtp = req.params.nikKtp;

    if (!nikKtp || nikKtp.length != 16) return next(new CustomError('NIK harus 16 digit angka', 400));

    const leads = await leadsRepo.findOne({
      select: {
        id: true,
        nik_ktp: true,
        nama: true,
        instansi: {
          id: true,
          nama_instansi: true,
          master_instansi_id: true,
        },
      },
      relations: ['instansi'],
      where: {
        nik_ktp: nikKtp,
      },
    });

    if (!leads)
      return next(
        new CustomError(
          'Maaf anda belum dapat terdaftar. Silahkan menghubungi PIC Marketing kami pada Instansi Anda',
          404,
        ),
      );

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
    const body = req.body as Leads;

    if (body.pic_selena) body.updated_at_selena = new Date();

    const leads = await leadsRepo.update(req.params.id, {
      ...body,
      updated_by: req.user.nik,
    });

    const dataRes = {
      leads: leads,
    };

    return res.customSuccess(200, 'Update leads success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const checkKTPAndApprove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentLeads = await leadsRepo.findOne({ where: { id: +req.params.id } });

    const getIp = parseIp(req);

    if (currentLeads.nik_ktp && currentLeads.is_ktp_valid == 0 && !currentLeads.is_badan_usaha) {
      const checkKTP = await APIPegadaian.checkEktpDukcapil({
        nama: currentLeads.nama,
        nik: currentLeads.nik_ktp,
        ipUser: getIp,
      });

      if (checkKTP.status !== 200) throw new Error(checkKTP.data.toString());

      const ktpData = checkKTP?.data?.data;

      if (!ktpData) return next(new CustomError('Data NIK EKTP tidak ditemukan', 404));

      if (ktpData.namaLengkap.toUpperCase().includes('TIDAK'))
        return next(new CustomError('Data NIK EKTP Tidak Valid', 400));
    }

    const leads = await leadsRepo.update(req.params.id, {
      status: 1,
      is_ktp_valid: 1,
      updated_by: req.user.nik,
      approved_at: new Date(),
    });

    const dataRes = {
      leads: leads,
    };

    return res.customSuccess(200, 'Update leads success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const bulkCheckKTPAndApprove = async (req: Request, res: Response, next: NextFunction) => {
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const idLeads: string[] = req.body.leads_id;

    for (const id of idLeads) {
      const currentLeads = await leadsRepo.findOne({ where: { id: Number(id) } });

      const getIp = parseIp(req);

      if (currentLeads.nik_ktp && currentLeads.is_ktp_valid == 0 && !currentLeads.is_badan_usaha) {
        const checkKTP = await APIPegadaian.checkEktpDukcapil({
          nama: currentLeads.nama,
          nik: currentLeads.nik_ktp,
          ipUser: getIp,
        });

        if (checkKTP.status !== 200) throw new Error(checkKTP.data.toString());

        const ktpData = checkKTP?.data?.data;

        if (!ktpData) {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();

          return next(new CustomError('Data NIK EKTP tidak ditemukan', 404));
        }

        if (ktpData.namaLengkap.toUpperCase().includes('TIDAK')) {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();

          return next(new CustomError('Data NIK EKTP Tidak Valid', 400));
        }
      }

      await queryRunner.manager.update(Leads, Number(id), {
        status: 1,
        is_ktp_valid: 1,
        updated_by: req.user.nik,
        approved_at: new Date(),
      });
    }

    await queryRunner.commitTransaction();
    await queryRunner.release();

    const dataRes = {
      leads: true,
    };

    return res.customSuccess(200, 'Update leads success', dataRes);
  } catch (e) {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();

    return next(e);
  }
};

export const rejectLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentLeads = await leadsRepo.findOne({ where: { id: +req.params.id } });

    if (!currentLeads) return next(new CustomError('Data tidak ditemukan', 404));

    if (currentLeads.status == 1) return next(new CustomError('Leads sudah di approve', 404));

    await leadsRepo.delete({ id: +req.params.id });

    const dataRes = {
      leads: null,
    };

    return res.customSuccess(200, 'Data leads di-tolak dan di-hapus', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const deleteLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleteLeads = await leadsRepo.delete({ id: +req.params.id });

    const dataRes = {
      leads: deleteLeads,
    };

    return res.customSuccess(200, 'Data leads di-hapus', dataRes);
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

    return res.customSuccess(200, 'Get leads', dataRes, {
      count: count,
      rowCount: paging.limit,
      limit: paging.limit,
      offset: paging.offset,
      page: Number(req.query.page),
    });
  } catch (e) {
    return next(e);
  }
};

export const createNewLeadsPerorangan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodies = req.body as Leads;

    if (!bodies.cif && !bodies.nik_ktp) {
      return next(new CustomError('CIF atau NIK wajib di-isi', 400));
    }

    if (!bodies.is_ktp_valid) return next(new CustomError('NIK KTP harus valid', 400));

    const findEvent = await eventRepo.findOne({ where: { id: bodies.event_id } });

    if (!findEvent) return next(new CustomError('Event tidak ditemukan', 400));

    const dateDiff = Math.abs(common.getDiffDateCount(dayjs().format('YYYY-MM-DD'), findEvent.tanggal_event));

    if (dateDiff > +process.env.DATERANGE_LEADS_CREATE_EVENT)
      return next(new CustomError('Tanggal event telah expired', 400));

    const getExistingLeads = await leadsRepo.findOne({
      where: { nik_ktp: bodies.nik_ktp },
      relations: ['user_created'],
    });

    if (getExistingLeads) {
      return next(
        new CustomError(
          `NIK ${getExistingLeads.nik_ktp} dengan kode produk ${bodies.kode_produk} telah diprospek oleh ${getExistingLeads.user_created.nik}`,
          400,
        ),
      );
    }

    if (!bodies.nik_ktp_karyawan) {
      bodies.is_karyawan = 1;
    }

    req.body.nama = bodies.nama.toUpperCase();
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

export const createNewLeadsBadanUsaha = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodies = req.body as Leads;

    if (!bodies.cif) {
      return next(new CustomError('CIF wajib di-isi', 400));
    }

    const getExistingLeads = await leadsRepo.findOne({
      where: { cif: bodies.cif, is_badan_usaha: 1 },
      relations: ['user_created'],
    });

    if (getExistingLeads) {
      return next(
        new CustomError(
          `CIF ${getExistingLeads.cif} dengan kode produk ${bodies.kode_produk} telah diprospek oleh ${getExistingLeads.user_created.nik}`,
          400,
        ),
      );
    }

    const findEvent = await eventRepo.findOne({ where: { id: bodies.event_id } });

    if (!findEvent) return next(new CustomError('Event tidak ditemukan', 400));

    const dateDiff = Math.abs(common.getDiffDateCount(dayjs().format('YYYY-MM-DD'), findEvent.tanggal_event));

    if (dateDiff > +process.env.DATERANGE_LEADS_CREATE_EVENT)
      return next(new CustomError('Tanggal event telah expired', 400));

    if (!bodies.nik_ktp_karyawan) {
      bodies.is_karyawan = 1;
    }

    req.body.nama = bodies.nama.toUpperCase();

    const leads = await leadsRepo.save({
      ...req.body,
      kode_unit_kerja: req.user.kode_unit_kerja,
      created_by: req.user.nik,
      updated_by: req.user.nik,
      source_data: 'FORM INPUT DATA',
      expired_referral: addDays(30),
      status: 0,
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

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const bodies = req.body as Leads;

    const findEvent = await eventRepo.findOne({ where: { id: bodies.event_id } });

    if (!findEvent) return next(new CustomError('Event tidak ditemukan', 400));

    const dateDiff = Math.abs(common.getDiffDateCount(dayjs().format('YYYY-MM-DD'), findEvent.tanggal_event));

    if (dateDiff > +process.env.DATERANGE_LEADS_CREATE_EVENT) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return next(new CustomError('Tanggal event telah expired', 400));
    }

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
        leads.is_karyawan = row[5] ? 0 : 1;
        leads.created_by = req.user.nik;
        leads.kode_unit_kerja = req.user.kode_unit_kerja;
        leads.source_data = 'BULK CSV';
        leads.expired_referral = addDays(30);
        leads.is_ktp_valid = 0;

        dataInput.push(leads);
      })
      .on('end', async () => {
        const nik: string[] = [];
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
            },
            transaction: true,
          });

          if (!checkExistingLeads && !nik.includes(data.nik_ktp)) {
            await queryRunner.manager.save(Leads, data);
            nik.push(data.nik_ktp);
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

        const msg = `${nik.length} Data Leads Berhasil Di-input`;

        return res.customSuccess(200, msg, dataRes);
      })
      .on('error', async (error) => {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();

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
    let isCifValid = false;
    let isKTPValid = false;

    const checkToNasabahPerorangan = await nasabahPeroranganRepo.findOne({ where: { nik: bodies.nik } });

    if (checkToNasabahPerorangan) {
      const dataRes = {
        isNewCif: false,
        isKTPValid: true,
        isCifValid: true,
        nasabah: {
          nik: checkToNasabahPerorangan.nik || null,
          cif: checkToNasabahPerorangan.cif || null,
          nama: checkToNasabahPerorangan.nama || '',
        },
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
      isCifValid = true;

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
      isCifValid,
      nasabah: {
        nik: nasabah?.nik || req.body.nik,
        cif: nasabah?.cif || null,
        nama: nasabah?.nama || '',
      },
    };

    return res.customSuccess(200, 'Check data KTP success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getNasabahByCif = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodies = req.body;
    let isNewCif = true;

    const checkToNasabahPerorangan = await nasabahPeroranganRepo.findOne({ where: { cif: bodies.cif } });

    if (checkToNasabahPerorangan) {
      const dataRes = {
        isNewCif: false,
        isCifValid: true,
        isKTPValid: true,
        nasabah: {
          nik: checkToNasabahPerorangan.nik || null,
          cif: checkToNasabahPerorangan.cif || req.body.cif,
          nama: checkToNasabahPerorangan.nama || '',
        },
      };

      return res.customSuccess(200, 'Check data CIF success', dataRes);
    }

    const nasabahReq = await APIPegadaian.getNasabahByCif({
      cif: bodies.cif,
    });
    getNasabahByCif;
    if (nasabahReq.status !== 200) throw new Error(nasabahReq.data.toString());

    const nasabah = JSON.parse(nasabahReq.data.data);

    if (!nasabah) return next(new CustomError(`Data CIF tidak ditemukan`, 404));

    if (nasabah) {
      await nasabahPeroranganRepo.save({
        nik: nasabah.noIdentitas,
        cif: nasabah.cif,
        nama: nasabah.namaNasabah,
        created_by: req.user.nik,
        source_data: 'PASSION',
      });

      isNewCif = false;
    }

    const dataRes = {
      isNewCif,
      isCifValid: true,
      isKTPValid: true,
      nasabah: {
        nik: nasabah.noIdentitas || null,
        cif: nasabah.cif || req.body.cif,
        nama: nasabah.namaNasabah || '',
      },
    };

    return res.customSuccess(200, 'Check data CIF success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const checkBadanUsahaByCif = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodies = req.body;

    const checkToNasabahBadanUsaha = await nasabahBadanUsahaRepo.findOne({ where: { cif: bodies.cif } });

    if (checkToNasabahBadanUsaha) {
      const dataRes = {
        badanUsaha: {
          cifBadanUsaha: checkToNasabahBadanUsaha.cif,
          namaBadanUsaha: checkToNasabahBadanUsaha.nama,
          namaPengurusKorp: checkToNasabahBadanUsaha.nama_pic,
          noIdPengurus: checkToNasabahBadanUsaha.nik_pic,
          noTelpBadanUsaha: checkToNasabahBadanUsaha.no_telp,
        } as IResponseBadanUsaha,
        originalReponse: 'Approved',
        source_data: 'KAMILA',
      };

      return res.customSuccess(200, 'Get badan usaha', dataRes);
    }

    let badanUsahaReq = await APIPegadaian.getBadanUsahaByCif({
      cif: bodies.cif,
      flag: 'K',
    });

    if (badanUsahaReq.status !== 200) throw new Error(badanUsahaReq.data.toString());

    if (!badanUsahaReq.data.data) {
      badanUsahaReq = await APIPegadaian.getBadanUsahaByCif({
        cif: bodies.cif,
        flag: 'S',
      });
    }

    const badanUsaha = JSON.parse(badanUsahaReq.data.data) as IResponseBadanUsaha;

    if (badanUsaha) {
      await nasabahBadanUsahaRepo.save({
        cif: badanUsaha.cifBadanUsaha,
        nama: badanUsaha.namaBadanUsaha,
        nama_pic: badanUsaha.namaPengurusKorp,
        nik_pic: badanUsaha.noIdPengurus,
        no_telp: badanUsaha.noTelpBadanUsaha,
        created_by: req.user.nik,
      });
    }

    const dataRes = {
      badanUsaha: badanUsaha
        ? {
            cifBadanUsaha: badanUsaha.cifBadanUsaha,
            namaBadanUsaha: badanUsaha.namaBadanUsaha,
            namaPengurusKorp: badanUsaha.namaPengurusKorp,
            noIdPengurus: badanUsaha.noIdPengurus,
            noTelpBadanUsaha: badanUsaha.noTelpBadanUsaha,
          }
        : null,
      originalReponse: badanUsahaReq?.data?.responseDesc,
      source_data: 'PASSION',
    };

    return res.customSuccess(200, 'Get badan usaha', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getNIKKaryawan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where: FindOptionsWhere<Leads> = {};

    const filter = {
      nama: req.query.nama,
      event_id: req.query.event_id ? +req.query.event_id : null,
    };

    if (filter.nama) {
      where['nama'] = ILike(`%${filter.nama}%`);
    }

    if (filter.event_id) {
      where['event_id'] = filter.event_id;
    }

    where['is_ktp_valid'] = 1;
    where['is_badan_usaha'] = 0;
    where['is_karyawan'] = 1;

    const nik_karyawan = await leadsRepo.find({
      select: {
        nik_ktp: true,
        nama: true,
      },
      where,
    });

    const dataRes = {
      nik_karyawan,
    };

    return res.customSuccess(200, 'Get leads', dataRes);
  } catch (e) {
    return next(e);
  }
};
