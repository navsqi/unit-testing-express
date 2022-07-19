import { NextFunction, Request, Response } from 'express';
import { ILike } from 'typeorm';
import { objectUpload } from '~/config/minio';
import { dataSource } from '~/orm/dbCreateConnection';
import Event from '~/orm/entities/Event';
import { generateFileName } from '~/utils/common';
import queryHelper from '~/utils/queryHelper';

const eventRepo = dataSource.getRepository(Event);

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let photo: Express.Multer.File = null;
    const bodies = req.body as Event;
    const ev = new Event();
    let fileName: string = null;

    if (req.files && req.files['file']) {
      photo = req.files['file'][0];
      fileName = 'hblevent/' + generateFileName(photo.originalname);

      await objectUpload(process.env.MINIO_BUCKET, fileName, photo.buffer, {
        'Content-Type': req.files['file'][0].mimetype,
        'Content-Disposision': 'inline',
      });
    }

    ev.instansi_id = bodies.instansi_id;
    ev.kode_unit_kerja = bodies.kode_unit_kerja ? bodies.kode_unit_kerja : req.user.kode_unit_kerja;
    ev.nama_event = bodies.nama_event;
    ev.nama_pic = bodies.nama_pic;
    ev.nomor_hp_pic = bodies.nomor_hp_pic;
    ev.jenis_event = bodies.jenis_event;
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
    const where = {};
    const qs = req.query;

    const filter = {
      nama_event: qs.nama_event,
      is_session: +qs.is_session,
      instansi_id: +qs.instansi_id,
    };

    if (filter.nama_event) {
      where['nama_event'] = ILike(`%${filter.nama_event}%`);
    }

    if (filter.is_session === 1) {
      where['created_by'] = req.user.nik;
    }

    if (filter.instansi_id) {
      where['instansi_id'] = filter.instansi_id;
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
    const event = await eventRepo.update(req.params.id, {
      ...req.body,
      updated_by: req.user.nik,
    });

    if (event.affected > 0) {
      // update photo
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
    const event = await eventRepo.delete({ id: +req.params.id });

    if (event.affected > 0) {
      // delete photo
    }

    const dataRes = {
      event: event,
    };

    return res.customSuccess(200, 'Delete event success', dataRes);
  } catch (e) {
    return next(e);
  }
};
