import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import Promo from './Promo';
  import PromoMicrositeFoto from './PromoMicrositePhoto';
  
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

  
  @OneToOne(() => Promo)
  @JoinColumn([{ name: 'promo_id', referencedColumnName: 'id' }])
  promo: Promo;
  
  @OneToMany(() => PromoMicrositeFoto, (promoFoto) => promoFoto.promo_microsite)
  photo: PromoMicrositeFoto[];
  }

  
  export default PromoMicrosite;
  