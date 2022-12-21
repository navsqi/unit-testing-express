import { NextFunction, Request, Response } from 'express';
import { dataSource } from '~/orm/dbCreateConnection';
import { Between, FindOptionsWhere, ILike, In } from 'typeorm';
import CustomError from '~/utils/customError';
import queryHelper from '~/utils/queryHelper';
import MasterMenu from '~/orm/entities/MasterMenu';
import Promo from '~/orm/entities/Promo';

const promoRepo = dataSource.getRepository(Promo);

  export const getPromo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const where: FindOptionsWhere<Promo> = {};
      const qs = req.query;
  
      const filter = {
        id: (qs.id as string) || '',
        start_date: (qs.start_date as string) || '',
        end_date: (qs.end_date as string) || '',
      };
  
      if (filter.id) {
        where['id'] = filter.id;
      }

      if (filter.start_date && filter.end_date) {
        where['tgl_pengajuan'] = Between(
          new Date(`${filter.start_date} 00:00:00`),
          new Date(`${filter.end_date} 23:59:59`),
        );
      }
  
      const paging = queryHelper.paging(req.query);
  
      const [promo, count] = await promoRepo.findAndCount({
        // select: {
        //   produk: {
        //     kode_produk: true,
        //     nama_produk: true,
        //   },
        //   promo_voucher: {
        //     id_promosi: true,
        //     kode_voucher: true,
        //     promo_id: true,
        //     total_promosi: true,
        //     start_date: true,
        //     end_date: true,
        //     jumlah_voucher: true,
        //     potongan_rp: true,
        //     tempat: true,
        //     potongan_persentase: true,
        //     minimal_rp: true,
        //     maksimal_rp: true,
        //     kode_booking: true,
        //     is_active: true,
        //     is_deleted: true,
        // },
        // promo_microsite: {
        //     promo_microsite_id: true,
        //     promo_id: true,
        //     promo_microsite: {
        //         nama_promosi:true,
        //         keterangan_promosi:true,
        //         promo_id: true,
        //         start_date: true,
        //         end_date: true,
        //         is_active: true,
        //         is_deleted: true,
        //     },
        // }
        //  },
        //  relations: {
        //    promo_microsite: true,
        //    promo_voucher: true,
        //    produk:true, 
        // },
        take: paging.limit,
        skip: paging.offset,
        order: {
          created_at: 'desc',
        },
      });
  
      const dataRes = {
        promo: promo
      };
  
      return res.customSuccess(200, 'Get Promo', dataRes, {
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

export const createNewPromo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bodies = req.body as Promo;
      const promo = new Promo();

      
      promo.id = bodies.id;
      promo.nama_promosi = bodies.nama_promosi;
      promo.kode_produk = bodies.kode_produk;
      promo.jenis_promosi = bodies.jenis_promosi;
      promo.tipe_transaksi = bodies.tipe_transaksi;
      promo.jenis_voucher = bodies.jenis_voucher;
      promo.jenis_transaksi = bodies.jenis_transaksi;
      promo.tipe_nasabah = bodies.tipe_nasabah;
      promo.tipe_promosi = bodies.tipe_promosi;
      promo.start_date = bodies.start_date;
      promo.end_date = bodies.end_date;
      promo.total_promosi = bodies.total_promosi;
      promo.nilai_per_transaksi = promo.tipe_transaksi === 'FIXED' ? bodies.nilai_per_transaksi : 0;
      promo.tipe_alokasi = bodies.tipe_alokasi;
      promo.is_active = true;
      promo.is_deleted = bodies.is_deleted;
      promo.created_by = req.user.nik;
      promo.updated_by = req.user.nik;

      await promoRepo.save(promo);
    
  
  
      const dataRes = {
        promo,
      };
  
      return res.customSuccess(200, 'Create promo success', dataRes);
    } catch (e) {
      return next(e);
    }
  };