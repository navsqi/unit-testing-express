import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import PromoMicrositeFoto from './PromoMicrositePhoto';
  import BannerPromo from './BannerPromo';
  
  @Entity('promo_microsite', { synchronize: false })
  class PromoMicrosite {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  nama_promosi: string;
  
  @Column({
    type: 'varchar',
  })
  keterangan_promosi: string;

  @Column({
    type: 'varchar',
  })
  promo_id: string;

  @Column({
    type: 'date',
  })
  start_date: string;
    
 @Column({
   type: 'date',
  })
  end_date: string;

  @Column({
    default: false,
  })
  is_active: boolean;

  @Column({
    default: false,
  })
  is_deleted: boolean;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  created_by: string;

  @Column()
  updated_by: string;


  
  @OneToMany(() => PromoMicrositeFoto, (promoFoto) => promoFoto.promo_microsite)
  photo: PromoMicrositeFoto[];

  @OneToMany(() => BannerPromo, (bannerPromo) => bannerPromo.promo_microsite)
  promo: BannerPromo[];
  }

  
  export default PromoMicrosite;
  