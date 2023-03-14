import dayjs from 'dayjs';
import { In } from 'typeorm';
import { dataSource } from '~/orm/dbCreateConnection';
import User from '~/orm/entities/User';
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

      // CHECK NIK MO
      const userMo = await manager.findOne<User>(User, {
        select: { nik: true, nama: true },
        where: { kode_unit_kerja: kode_unit_kerja_pencairan, kode_role: In(['MKTO', 'BPO', 'BPO1', 'BPO2']) },
        order: { last_login: 'DESC' },
      });
      const nikMo = userMo ? userMo.nik : null;
      const namaMo = userMo ? userMo.nama : null;
      // END OF CHECK NIK MO

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
          kode_produk,
          nik_mo,
          nama_mo) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);
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
            nikMo,
            namaMo,
          ],
        );
      }

      // =========== SAVE OSL ===========
      const checkOSL = await manager.query(
        `SELECT * FROM leads_closing_osl lc WHERE lc.no_kontrak = '${tmpKredit.no_kontrak}' order by created_at desc limit 1`,
      );
      if (
        (checkOSL &&
          checkOSL.length > 0 &&
          checkOSL[0].osl != tmpKredit.osl &&
          checkOSL[0].tgl_kredit != tmpKredit.tgl_kredit) ||
        checkOSL.length < 1
      ) {
        await manager.query(
          `INSERT INTO leads_closing_osl
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
          osl, 
          channeling_syariah, 
          status_new_cif, 
          channel_id, 
          channel, 
          kode_produk,
          nik_mo,
          nama_mo) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);
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
            tmpKredit.osl,
            tmpKredit.channeling_syariah,
            0,
            tmpKredit.channel_id,
            tmpKredit.nama_channel,
            tmpKredit.product_code,
            nikMo,
            namaMo,
          ],
        );
      } else if (
        checkOSL &&
        checkOSL.length > 0 &&
        checkOSL[0].osl != tmpKredit.osl &&
        checkOSL[0].tgl_kredit == tmpKredit.tgl_kredit
      ) {
        // update osl
        if (tmpKredit.osl < checkOSL[0].osl) {
          await manager.query(`UPDATE leads_closing_osl SET osl = $1 WHERE no_kontrak = $2 AND tgl_kredit = $3`, [
            tmpKredit.osl,
            checkOSL[0].no_kontrak,
            checkOSL[0].tgl_kredit,
          ]);
        }
      }
      // =========== end of SAVE OSL ===========

      // update cif jika nomor cif null
      await manager.query(
        `UPDATE leads SET cif = $1, cif_created_at = $2, step = 'CLS' WHERE nik_ktp = $3 AND id = '${tmpKredit.leads_id}' AND cif IS NULL AND step = 'CLP'`,
        [tmpKredit.cif, tmpKredit.tgl_cif, tmpKredit.nik_ktp],
      );

      await manager.query(`DELETE FROM history_tmp_kredit WHERE tgl_kredit = $1`, [tmpKredit.tgl_kredit]);
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

      // handle unit kerja untuk produk TE Korporasi
      let kode_unit_kerja = tmpKredit.kode_outlet;
      let kode_unit_kerja_pencairan = tmpKredit.kode_outlet_pencairan;

      if (kode_unit_kerja.startsWith('000')) {
        kode_unit_kerja = tmpKredit.cabang_leads;
        kode_unit_kerja_pencairan = tmpKredit.cabang_leads;
      }

      // CHECK NIK MO
      const userMo = await manager.findOne<User>(User, {
        select: { nik: true, nama: true },
        where: { kode_unit_kerja: kode_unit_kerja_pencairan, kode_role: In(['MKTO', 'BPO', 'BPO1', 'BPO2']) },
        order: { last_login: 'DESC' },
      });
      const nikMo = userMo ? userMo.nik : null;
      const namaMo = userMo ? userMo.nama : null;
      // END OF CHECK NIK MO

      // jika omset tabemas != 0 insert ke leads closing
      if (up != 0) {
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
          channeling_syariah,
          nik_mo,
          nama_mo) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);
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
            nikMo,
            namaMo,
          ],
        );

        // =========== SAVE SALDO TE ===========
        const checkSaldoTE = await manager.query(
          `SELECT * FROM leads_closing_osl lc WHERE lc.no_kontrak = '${tmpKredit.no_kontrak}' order by created_at desc limit 1`,
        );
        if (
          (checkSaldoTE &&
            checkSaldoTE.length > 0 &&
            checkSaldoTE[0].saldo_tabemas != tmpKredit.saldo &&
            checkSaldoTE[0].tgl_kredit != tmpKredit.tgl_kredit) ||
          checkSaldoTE.length < 1
        ) {
          await manager.query(
            `INSERT INTO leads_closing_osl 
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
          saldo_tabemas, 
          channeling_syariah, 
          status_new_cif, 
          channel_id, 
          channel, 
          kode_produk,
          nik_mo,
          nama_mo) VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);
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
              tmpKredit.saldo,
              tmpKredit.channeling_syariah,
              0,
              tmpKredit.channel_id,
              tmpKredit.nama_channel,
              tmpKredit.product_code,
              nikMo,
              namaMo,
            ],
          );
        } else if (
          checkSaldoTE &&
          checkSaldoTE.length > 0 &&
          checkSaldoTE[0].saldo_tabemas != tmpKredit.saldo &&
          checkSaldoTE[0].tgl_kredit == tmpKredit.tgl_kredit
        ) {
          // update saldo tabemas
          if (tmpKredit.saldo < checkSaldoTE[0].osl) {
            await manager.query(
              `UPDATE leads_closing_osl SET saldo_tabemas = $1 WHERE no_kontrak = $2 AND tgl_kredit = $3`,
              [tmpKredit.saldo, checkSaldoTE[0].no_kontrak, checkSaldoTE[0].tgl_kredit],
            );
          }
        }
        // =========== end of SAVE SALDO TE ===========

        // update status leads ke CLS
        await manager.query(
          `UPDATE leads SET step = $1, cif = $2, updated_at = now() WHERE id = '${tmpKredit.leads_id}' AND step = 'CLP'`,
          ['CLS', tmpKredit.cif],
        );
      }

      await manager.query(`DELETE FROM history_tmp_kredit_tabemas WHERE tgl_transaksi = $1`, [tmpKredit.tgl_kredit]);
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

// ==== CLOSING TABEMAS
export const schedulerDeleteActivity = async () => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  const manager = queryRunner.manager;

  try {
    logger.info('TRUNCATE_ACTIVITY', `TRUNCATE_ACTIVITY STARTING AT ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`);

    await manager.query(`TRUNCATE event_history RESTART IDENTITY`);

    await queryRunner.commitTransaction();
    await queryRunner.release();

    logger.info('TRUNCATE_ACTIVITY', `ENDED AT ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`);
  } catch (error) {
    logger.info('TRUNCATE_ACTIVITY', `ERROR ENDED AT ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`);
    logger.error(error, 'TRUNCATE_ACTIVITY_ERROR');
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  }
};
// ==== END OF CLOSING TABEMAS

export default {
  schedulerClosing,
  schedulerClosingTabemas,
  schedulerDeleteActivity,
};
