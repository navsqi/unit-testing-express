import { dataSource } from '~/orm/dbCreateConnection';
import Promo from '~/orm/entities/Promo';


export const getPromoDropdown = async (): Promise<Promo[]> => {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    const manager = queryRunner.manager;
  
    try {
      const konsolidasi: any[] = await manager.query(
        `SELECT
        *
        FROM
        promo
        WHERE
        EXISTS (
        SELECT
          promo_id FROM
          promo_voucher pv WHERE pv.promo_id = promo.id AND pv.is_active = TRUE
        )
        AND promo.is_active = TRUE AND is_deleted = FALSE`
      );
  
      await queryRunner.release();
  
      return konsolidasi;
    } catch (error) {
      await queryRunner.release();
      return error;
    }
  };
  