import dayjs from 'dayjs';
import { EntityManager, SelectQueryBuilder } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import logger from '~/utils/logger';

export const schedulerClosing = async () => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  const manager = queryRunner.manager;

  try {
    logger.info('QUERY_CLOSING', `STARTING AT ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`);
    // const q = manager.createQueryBuilder();

    // const data = await q.getRawMany();

    // Insert leads closing non top up tabemas
    await manager.query(
      `INSERT INTO leads_closing (
        leads_id, kode_produk, nik_ktp, no_kontrak, 
        marketing_code, tgl_fpk, tgl_cif, 
        tgl_kredit, kode_unit_kerja, kode_unit_kerja_pencairan, 
        up, outlet_syariah, cif
      ) 
      select 
        l.id as leads_id, 
        tk.product_code, 
        tk.nik, 
        tk.no_kontrak , 
        tk.marketing_code, 
        tk.tgl_fpk, 
        tk.tgl_cif, 
        tk.tgl_kredit, 
        tk.kode_outlet, 
        tk.kode_outlet as kode_outlet_pencairan, 
        tk.up, 
        tk.outlet_syariah, 
        tk.cif 
      FROM 
        (
          SELECT 
            * 
          FROM 
            tmp_kredit
        ) tk, 
        leads l
      WHERE 
        l.up_realisasi IS NULL 
        AND l.tanggal_realisasi IS NULL 
        AND l.nik_ktp = tk.nik 
        AND l.kode_produk = tk.product_code 
        AND CAST (l.created_at AS DATE) <= CAST (tk.tgl_fpk AS DATE) 
        AND l.step = 'CLP' 
      `,
    );

    // Update leads kredit non top up tabemas
    await manager.query(
      `UPDATE 
        leads as l 
      SET 
        up_realisasi = tk.up_realisasi, 
        tanggal_realisasi = tk.tgl_kredit, 
        step = 'CLS' 
      FROM 
        (
          SELECT 
            SUM (up) AS up_realisasi, 
            nik, 
            product_code, 
            tgl_kredit, 
            tgl_fpk 
          FROM 
            tmp_kredit 
          GROUP BY 
            nik, 
            product_code, 
            tgl_kredit, 
            tgl_fpk
        ) tk 
      WHERE 
        l.up_realisasi IS NULL 
        AND l.tanggal_realisasi IS NULL 
        AND l.nik_ktp = tk.nik 
        AND l.kode_produk = tk.product_code 
        AND CAST (l.created_at  AS DATE) <= CAST (tk.tgl_fpk AS DATE) 
        AND l.step = 'CLP'
      `,
    );

    // Insert leads closing kredit topup tabemas
    await manager.query(
      `INSERT INTO leads_closing (
        leads_id, kode_produk, nik_ktp, no_kontrak, 
        marketing_code, tgl_fpk, tgl_cif, 
        tgl_kredit, kode_unit_kerja, kode_unit_kerja_pencairan, 
        up, cif
      ) 
      select 
        l.id as leads_id, 
        tk.product_code, 
        tk.nik, 
        tk.no_rekening as no_kontrak, 
        tk.marketing_code, 
        tk.tgl_trx as tgl_fpk, 
        tk.tgl_cif, 
        tk.tgl_trx as tgl_kredit, 
        tk.kode_outlet, 
        tk.kode_outlet as kode_outlet_pencairan, 
        tk.up, 
        tk.cif 
      FROM 
        (
          SELECT 
            * 
          FROM 
            tmp_top_up_tabemas
        ) tk, 
        leads l
      WHERE 
        l.up_realisasi IS null 
        AND l.tanggal_realisasi IS NULL 
        AND l.nik_ktp = tk.nik 
        AND l.kode_produk = tk.product_code 
        AND CAST (l.created_at AS DATE) <= CAST (tk.tgl_trx AS DATE) 
        AND l.step = 'CLP'      
      `,
    );

    // Update leads closing kredit topup tabemas
    await manager.query(
      `UPDATE 
        leads AS l 
      SET 
        up_realisasi = tk.up_realisasi, 
        tanggal_realisasi  = tk.tgl_trx, 
        kode_unit_kerja_realisasi = tk.kode_outlet, 
        step = 'CLS' 
      FROM 
        (
          SELECT 
            SUM(up) AS up_realisasi, 
            nik, 
            product_code, 
            tgl_trx, 
            kode_outlet 
          FROM 
            tmp_top_up_tabemas 
          group by 
            nik, 
            tgl_trx, 
            product_code, 
            kode_outlet
        ) tk 
      WHERE 
        l.up_realisasi IS null 
        AND l.tanggal_realisasi IS NULL 
        AND l.nik_ktp = tk.nik 
        AND l.kode_produk = tk.product_code 
        AND CAST (l.created_at AS DATE) <= CAST (tk.tgl_trx AS DATE) 
        AND l.step = 'CLP'     
      `,
    );

    // update new cif
    await manager.query(
      `UPDATE 
        leads_closing lcs 
      set 
        status_new_cif = 1
      where 
        status_new_cif is null 
        and lcs.id in (
          select 
            lcs.id 
          from 
            leads l
            join leads_closing lcs on l.id = lcs.leads_id 
          where 
            CAST(l.created_at AS DATE) <= CAST(lcs.tgl_cif AS DATE) 
            and step = 'CLS' 
            and tanggal_realisasi is not null 
            and lcs.status_new_cif is null)     
      `,
    );

    await manager.query(`TRUNCATE tmp_kredit RESTART IDENTITY`);

    await queryRunner.commitTransaction();
    await queryRunner.release();

    logger.info('QUERY_CLOSING', `ENDED AT ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`);
  } catch (error) {
    logger.info('QUERY_CLOSING', `ERROR ENDED AT ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`);
    logger.error(error, 'QUERY_CLOSING_ERROR');
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  }
};

const queryA = async (manager: EntityManager) => {
  return true;
};

export default schedulerClosing;
