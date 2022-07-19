import { NextFunction, Request, Response } from 'express';
import { ILike } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import Produk from '~/orm/entities/Produk';
import queryHelper from '~/utils/queryHelper';

const produkRepo = dataSource.getRepository(Produk);

export const getProduk = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const where = {};

    const filter = {
      nama_produk: req.query.nama_produk,
    };

    if (filter.nama_produk) {
      where['nama_produk'] = ILike(`%${filter.nama_produk}%`);
    }

    where['cst'] = true;

    const paging = queryHelper.paging(req.query);

    const [produk, count] = await produkRepo.findAndCount({
      select: ['kode_produk', 'nama_produk'],
      take: paging.limit,
      skip: paging.offset,
      where,
      order: {
        kode_produk: 'ASC',
      },
    });

    const dataRes = {
      meta: {
        count,
        limit: paging.limit,
        offset: paging.offset,
      },
      produk,
    };

    return res.customSuccess(200, 'Get produk', dataRes);
  } catch (e) {
    return next(e);
  }
};
