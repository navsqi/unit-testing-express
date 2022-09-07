import { NextFunction, Request, Response } from 'express';
import { Between, FindOptionsWhere, ILike, In } from 'typeorm';
import { objectRemove, objectUpload } from '~/config/minio';
import { dataSource } from '~/orm/dbCreateConnection';
import Event from '~/orm/entities/Event';
import Instansi from '~/orm/entities/Instansi';
import { konsolidasiTopBottom } from '~/services/konsolidasiSvc';
import { generateFileName } from '~/utils/common';
import CustomError from '~/utils/customError';
import queryHelper from '~/utils/queryHelper';
import * as common from '~/utils/common';
import dayjs from 'dayjs';

const eventRepo = dataSource.getRepository(Event);
const instansiRepo = dataSource.getRepository(Instansi);

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  let fileName: string = null;

  try {
    let photo: Express.Multer.File = null;
    const bodies = req.body as Event;

    const dateDiff = Math.abs(common.getDiffDateCount(dayjs().format('YYYY-MM-DD'), bodies.tanggal_event));

    if (dateDiff > 7) return next(new CustomError('Tanggal event melebihi 7 hari per-hari ini', 400));

    const ev = new Event();

    const getKodeUnitKerjaInstansi = await instansiRepo.findOne({ where: { id: bodies.instansi_id } });

    if (!getKodeUnitKerjaInstansi) return next(new CustomError('Instansi tidak ditemukan', 400));

    if (req.files && req.files['file']) {
      photo = req.files['file'][0];
      fileName = 'hblevent/' + generateFileName(photo.originalname);

      await objectUpload(process.env.MINIO_BUCKET, fileName, photo.buffer, {
        'Content-Type': req.files['file'][0].mimetype,
        'Content-Disposision': 'inline',
      });
    }

    ev.instansi_id = bodies.instansi_id;
    ev.kode_unit_kerja = getKodeUnitKerjaInstansi.kode_unit_kerja;
    ev.nama_event = bodies.nama_event;
    ev.nama_pic = bodies.nama_pic;
    ev.nomor_hp_pic = bodies.nomor_hp_pic;
    ev.jenis_event = bodies.jenis_event;
    ev.keterangan = bodies.keterangan;
    ev.foto_dokumentasi = fileName;
    ev.tanggal_event = bodies.tanggal_event;
    ev.flag_app = bodies.flag_app ? bodies.flag_app : 'KAMILA';
    ev.created_by = bodies.created_by ? bodies.created_by : req.user.nik;

    const newEvent = await eventRepo.save(ev);

    const dataRes = {
      event: newEvent,
    };

    return res.customSuccess(200, 'New event created', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where: FindOptionsWhere<Event> = {};
    const qs = req.query;
    let outletIds = [];

    const filter = {
      nama_event: qs.nama_event,
      is_session: +qs.is_session,
      instansi_id: +qs.instansi_id,
      start_date: (qs.start_date as string) || '',
      end_date: (qs.end_date as string) || '',
    };

    if (filter.nama_event) {
      where['nama_event'] = ILike(`%${filter.nama_event}%`);
    }

    if (filter.is_session === 1) {
      where['created_by'] = req.user.nik;
    }

    if (!filter.is_session) {
      const outletId = (req.query.kode_unit_kerja || req.user.kode_unit_kerja) as string;

      if (!outletId.startsWith('000')) {
        outletIds = await konsolidasiTopBottom(outletId as string);
      }

      if (outletIds.length > 0) {
        where['kode_unit_kerja'] = In(outletIds);
      }
    }

    if (filter.instansi_id) {
      where['instansi_id'] = filter.instansi_id;
    }

    if (filter.start_date && filter.end_date) {
      where['tanggal_event'] = Between(filter.start_date, filter.end_date);
    }

    const paging = queryHelper.paging(req.query);

    const [event, count] = await eventRepo.findAndCount({
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
      event,
    };

    return res.customSuccess(200, 'Get event', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await eventRepo.findOne({
      where: {
        id: +req.params.id,
      },
      relations: { instansi: true },
    });

    const dataRes = {
      event,
    };

    return res.customSuccess(200, 'Get event', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const findEvent = await eventRepo.findOne({ where: { id: +req.params.id } });

    const event = await eventRepo.update(req.params.id, {
      ...req.body,
      updated_by: req.user.nik,
    });

    if (event.affected > 0) {
      if (findEvent.foto_dokumentasi) {
        await objectRemove(process.env.MINIO_BUCKET, findEvent.foto_dokumentasi);
      }
    }

    const dataRes = {
      event: event,
    };

    return res.customSuccess(200, 'Update event success', dataRes);
  } catch (e) {
    return next(e);
  }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const findEvent = await eventRepo.findOne({ where: { id: +req.params.id } });

    const event = await eventRepo.delete({ id: +req.params.id });

    if (event.affected > 0) {
      if (findEvent.foto_dokumentasi) {
        await objectRemove(process.env.MINIO_BUCKET, findEvent.foto_dokumentasi);
      }
    }

    const dataRes = {
      event: event,
    };

    return res.customSuccess(200, 'Delete event success', dataRes);
  } catch (e) {
    return next(e);
  }
};
