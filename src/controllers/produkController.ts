import { NextFunction, Request, Response } from 'express';
import { FindManyOptions, getRepository, ILike } from 'typeorm';
import Produk from '~/orm/entities/Produk';
import queryHelper from '~/utils/queryHelper';

export const getProduk = async (req: Request, res: Response, next: NextFunction) => {
  const produkRepo = getRepository(Produk);

  try {
    const where: FindManyOptions<Produk> = {};

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
