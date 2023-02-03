import dayjs from 'dayjs';
import { dataSource } from '~/orm/dbCreateConnection';
import { ITmpKreditQuery, ITmpKreditTabemasQuery } from '~/types/queryClosingTypes';
import logger from '~/utils/logger';
import queryClosing from '~/utils/queryClosing';

// ==== CLOSING NON TABEMAS
export const schedulerClosing = async () => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  const manager = queryRunner.manager;

  try {
    logger.info('QUERY_CLOSING', `TMP_KREDIT STARTING AT ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`);

    // Select tmp_kredit
    const tmpKredits: ITmpKreditQuery[] = await manager.query(queryClosing.selectTmpKredit);

    // memproses semua baris yang ada pada table tmp_kredit
    for (const tmpKredit of tmpKredits) {
      // Check no kredit duplikat
      const checkNoKredit = await manager.query(
        `SELECT * FROM leads_closing lc WHERE lc.no_kontrak = '${tmpKredit.no_kontrak}'`,
      );

      // handle unit kerja untuk produk Gadai Efek & PMP (karena unit kerjanya di pusat)
      let kode_unit_kerja = tmpKredit.kode_outlet;
      let kode_unit_kerja_pencairan = tmpKredit.kode_outlet_pencairan;

      if (kode_unit_kerja.startsWith('000')) {
        kode_unit_kerja = tmpKredit.cabang_leads;
        kode_unit_kerja_pencairan = tmpKredit.cabang_leads;
      }

      // jika tidak duplikat no kredit/kontrak insert ke tb leads_closing & up != 0
      if (checkNoKredit.length < 1 || !checkNoKredit) {
        await manager.query(
          `INSERT INTO leads_closing 
        (leads_id, 
          nik_ktp, 
          cif, 
          no_kontrak, 
          marketing_code, 
          tgl_fpk, 
          tgl_cif, 
          tgl_kredit, 
          kode_unit_kerja, 
          kode_unit_kerja_pencairan, 
          up, 
          channeling_syariah, 
          status_new_cif, 
          channel_id, 
          channel, 
          kode_produk) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);
        `,
          [
            tmpKredit.leads_id,
            tmpKredit.nik_ktp,
            tmpKredit.cif,
            tmpKredit.no_kontrak,
            tmpKredit.marketing_code,
            tmpKredit.tgl_fpk,
            tmpKredit.tgl_cif, // tgl cif
            tmpKredit.tgl_kredit,
            kode_unit_kerja,
            kode_unit_kerja_pencairan,
            tmpKredit.up,
            tmpKredit.channeling_syariah,
            0,
            tmpKredit.channel_id,
            tmpKredit.nama_channel,
            tmpKredit.product_code,
          ],
        );
      }

      // update cif jika nomor cif null
      await manager.query(
        `UPDATE leads SET cif = $1, cif_created_at = $2, step = 'CLS' WHERE nik_ktp = $3 AND id = '${tmpKredit.leads_id}' AND cif IS NULL AND step = 'CLP'`,
        [tmpKredit.cif, tmpKredit.tgl_cif, tmpKredit.nik_ktp],
      );
    }

    // menghapus data history bigdata
    await manager.query(
      `DELETE FROM history_tmp_kredit WHERE current_date > CAST(CAST(created_at_kamila AS DATE) + INTERVAL '31 DAY' AS DATE)`,
    );

    // insert data yang dikirim bigdata ke table history
    await manager.query(`INSERT INTO history_tmp_kredit SELECT * FROM tmp_kredit`);

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
// ==== END OF CLOSING NON TABEMAS

// ==== CLOSING TABEMAS
export const schedulerClosingTabemas = async () => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  const manager = queryRunner.manager;

  try {
    logger.info('QUERY_CLOSING', `TMP_KREDIT_TABEMAS STARTING AT ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`);

    // Select tmp_kredit
    const tmpKredits: ITmpKreditTabemasQuery[] = await manager.query(queryClosing.selectTmpKreditTabemas);

    // memproses semua baris yang ada pada table tmp_kredit
    for (const tmpKredit of tmpKredits) {
      const up = tmpKredit.jenis_transaksi === 'OPEN' ? tmpKredit.amount : tmpKredit.omset_te;

      // handle unit kerja untuk produk Gadai Efek & PMP (karena unit kerjanya di pusat)
      let kode_unit_kerja = tmpKredit.kode_outlet;
      let kode_unit_kerja_pencairan = tmpKredit.kode_outlet_pencairan;

      if (kode_unit_kerja.startsWith('000')) {
        kode_unit_kerja = tmpKredit.cabang_leads;
        kode_unit_kerja_pencairan = tmpKredit.cabang_leads;
      }

      // jika omset tabemas != 0 insert ke leads closing
      if (up == 0) {
        // jika tidak duplikat insert ke tb leads_closing
        await manager.query(
          `INSERT INTO leads_closing 
        (leads_id, 
          nik_ktp, 
          cif, 
          no_kontrak, 
          marketing_code, 
          tgl_fpk, 
          tgl_kredit, 
          kode_unit_kerja, 
          kode_unit_kerja_pencairan, 
          up, 
          status_new_cif, 
          channel_id,
          channel, 
          kode_produk,
          channeling_syariah) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);
        `,
          [
            tmpKredit.leads_id,
            tmpKredit.nik_ktp,
            tmpKredit.cif,
            tmpKredit.no_kontrak,
            tmpKredit.marketing_code,
            tmpKredit.tgl_fpk,
            tmpKredit.tgl_kredit,
            kode_unit_kerja,
            kode_unit_kerja_pencairan,
            up,
            0,
            tmpKredit.channel_id,
            tmpKredit.nama_channel,
            tmpKredit.product_code,
            tmpKredit.channeling_syariah,
          ],
        );

        // update status leads ke CLS
        await manager.query(
          `UPDATE leads SET step = $1, cif = $2, updated_at = now() WHERE id = '${tmpKredit.leads_id}' AND step = 'CLP'`,
          ['CLS', tmpKredit.cif],
        );
      }
    }

    // menghapus data history bigdata
    await manager.query(
      `DELETE FROM history_tmp_kredit_tabemas WHERE current_date > CAST(CAST(created_at_kamila AS DATE) + INTERVAL '31 DAY' AS DATE)`,
    );

    // insert data yang dikirim bigdata ke table history
    await manager.query(`INSERT INTO history_tmp_kredit_tabemas SELECT * FROM tmp_kredit_tabemas`);

    await manager.query(`TRUNCATE tmp_kredit_tabemas RESTART IDENTITY`);

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
// ==== END OF CLOSING TABEMAS

export default {
  schedulerClosing,
  schedulerClosingTabemas,
};
