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

    // Insert leads closing non top up tabemas [OK]
    await manager.query(
      `
      INSERT
        INTO
        leads_closing (
          leads_id,
          kode_produk ,
          nik_ktp,
          no_kontrak,
          marketing_code ,
          tgl_fpk,
          tgl_cif,
          tgl_kredit,
          kode_unit_kerja ,
          kode_unit_kerja_pencairan ,
          up,
          outlet_syariah ,
          cif,
          channel,
          osl,
          saldo_tabemas
        )
      SELECT
        l.id AS leads_id,
        tmpk.product_code,
        tmpk.nik_ktp,
        tmpk.no_kontrak,
        tmpk.marketing_code,
        tmpk.tgl_fpk,
        tmpk.tgl_cif,
        tmpk.tgl_kredit,
        tmpk.kode_outlet,
        tmpk.kode_outlet AS kode_outlet_pencairan,
        tmpk.up,
        tmpk.outlet_syariah,
        tmpk.cif,
        tmpk.nama_channel,
        tmpk.osl,
        tmpk.saldo_tabemas
      FROM
        (SELECT * FROM tmp_kredit) tmpk,
        leads l
      WHERE
        l.up_realisasi IS NULL
        AND l.tanggal_realisasi IS NULL
        AND l.nik_ktp = tmpk.nik_ktp
        AND CAST (l.created_at AS DATE) <= CAST ( tmpk.tgl_fpk AS DATE )
        AND l.step = 'CLP'
      `,
    );

    // Update leads kredit non top up tabemas [OK]
    await manager.query(
      `
      UPDATE
        leads AS l 
            SET
        step = 'CLS'
      FROM
        (
        SELECT
          nik_ktp,
          tgl_fpk,
          tgl_kredit
        FROM
          tmp_kredit
        GROUP BY
          nik_ktp,
          tgl_kredit,
          tgl_fpk
              ) tmpk
      WHERE
        l.nik_ktp = tmpk.nik_ktp
        AND CAST (l.created_at AS DATE) <= CAST (tmpk.tgl_fpk AS DATE)
        AND l.step = 'CLP'
      `,
    );

    // Insert leads closing kredit topup tabemas [OK]
    await manager.query(
      `
      INSERT
        INTO
        leads_closing (
        leads_id,
        kode_produk,
        nik_ktp,
        no_kontrak,
        marketing_code,
        tgl_fpk,
        tgl_cif,
        tgl_kredit,
        kode_unit_kerja,
        kode_unit_kerja_pencairan,
        up,
        cif
      ) 
      SELECT
        l.id AS leads_id,
        tmpt.product_code,
        tmpt.nik_ktp,
        tmpt.no_rekening AS no_kontrak,
        tmpt.marketing_code,
        tmpt.tgl_trx AS tgl_fpk,
        tmpt.tgl_cif,
        tmpt.tgl_trx AS tgl_kredit,
        tmpt.kode_outlet,
        tmpt.kode_outlet AS kode_outlet_pencairan,
        tmpt.up,
        tmpt.cif
      FROM
        (SELECT * FROM tmp_top_up_tabemas) tmpt, leads l
      WHERE
        l.up_realisasi IS NULL
        AND l.tanggal_realisasi IS NULL
        AND l.nik_ktp = tmpt.nik_ktp
        AND CAST (l.created_at AS DATE) <= CAST (tmpt.tgl_trx AS DATE)
        AND l.step = 'CLP';
      `,
    );

    // Update leads closing kredit topup tabemas [OK]
    await manager.query(
      `
      UPDATE
        leads AS l 
            SET
        step = 'CLS'
      FROM
        (
        SELECT
          nik_ktp,
          product_code,
          tgl_trx,
          kode_outlet
        FROM
          tmp_top_up_tabemas
        GROUP BY
          nik_ktp,
          tgl_trx,
          product_code,
          kode_outlet
              ) tk
      WHERE
        l.nik_ktp = tk.nik_ktp
        AND CAST (l.created_at AS DATE) <= CAST (tk.tgl_trx AS DATE)
        AND l.step = 'CLP'
      `,
    );

    // update new cif
    await manager.query(
      `
      UPDATE
        leads_closing lcs
      SET
        status_new_cif = 1
      WHERE
        status_new_cif = 0
        AND lcs.leads_id IN (
        SELECT
          l.id
        FROM
          leads l
        JOIN leads_closing lcs ON
          l.id = lcs.leads_id
        WHERE
          CAST(l.created_at AS DATE) <= CAST(lcs.tgl_cif AS DATE)
            AND step = 'CLS'
            AND lcs.status_new_cif = 0)   
      `,
    );

    await manager.query(`INSERT INTO history_kredit SELECT * FROM tmp_kredit`);
    // await manager.query(`INSERT INTO history_top_up_tabemas SELECT * FROM tmp_top_up_tabemas`);
    await manager.query(
      `DELETE FROM history_kredit WHERE current_date > CAST(CAST(tgl_kredit AS DATE) + INTERVAL '21 DAY' AS DATE)`,
    );
    // await manager.query(`TRUNCATE tmp_kredit RESTART IDENTITY`);

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
