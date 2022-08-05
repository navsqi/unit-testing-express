import { NextFunction, Request, Response } from 'express';
import { dataSource } from '~/orm/dbCreateConnection';
import Instansi from '~/orm/entities/Instansi';
import MasterInstansi from '~/orm/entities/MasterInstansi';
import OrganisasiPegawai from '~/orm/entities/OrganisasiPegawai';
import SaranaMedia from '~/orm/entities/SaranaMedia';
import { listInstansi, listMasterInstansi } from '~/services/instansiSrv';
import { konsolidasiTopBottom } from '~/services/konsolidasiSrv';
import { tanggal } from '~/utils/common';
import queryHelper from '~/utils/queryHelper';
import xls from '~/utils/xls';

const organisasiPegawaiRepo = dataSource.getRepository(OrganisasiPegawai);
const masterInsRepo = dataSource.getRepository(MasterInstansi);
const instansiRepo = dataSource.getRepository(Instansi);
const saranaMediaRepo = dataSource.getRepository(SaranaMedia);

export const getReportInstansi = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outletId = req.query.outlet_id || req.user.kode_unit_kerja;
    let outletIds = [];

    if (outletId != '00002') {
      outletIds = await konsolidasiTopBottom(outletId as string);
    }

    const filter = {
      nama_instansi: req.query.nama_instansi || '',
      start_date: req.query.start_date || '',
      end_date: req.query.end_date || '',
      is_approved: req.query.is_approved ? +req.query.is_approved : '',
      outlet_id: outletIds,
    };

    const paging = queryHelper.paging(req.query);

    const [instansi, count] = await listInstansi(filter, paging);

    const dataRes = {
      meta: {
        count,
        limit: paging.limit,
        offset: paging.offset,
      },
      instansi,
    };

    return res.customSuccess(200, 'Get instansi', dataRes);
  } catch (e) {
    return next(e);
  }
};
