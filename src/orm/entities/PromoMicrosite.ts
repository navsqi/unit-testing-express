import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import PromoMicrositePhoto from './PromoMicrositePhoto';
import PromoBanner from './PromoBanner';
import Promo from './Promo';

@Entity('promo_microsite', { synchronize: true })
class PromoMicrosite {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  nama_promosi: string;

  @Column({
    type: 'text',
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
    default: true,
  })
  is_active: boolean;

  @Column({
    default: false,
  })
  is_deleted: boolean;

  @Column({
    default: false,
  })
  is_klaim_mo: boolean;

  @Column()
  @CreateDateColumn()
  created_at?: Date;

  @Column()
  @UpdateDateColumn()
  updated_at?: Date;

  @Column({ nullable: true })
  created_by?: string;

  @Column({ nullable: true })
  updated_by?: string;

  @OneToMany(() => PromoMicrositePhoto, (promoFoto) => promoFoto.promo_microsite)
  photos?: PromoMicrositePhoto[];

  @OneToMany(() => PromoBanner, (bannerPromo) => bannerPromo.promo_microsite)
  promo?: PromoBanner[];

  thumbnail?: string;
  promos?: Promo[];
}

export default PromoMicrosite;
