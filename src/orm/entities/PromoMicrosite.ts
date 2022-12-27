import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import PromoMicrositePhoto from './PromoMicrositePhoto';
import PromoBanner from './PromoBanner';
import Promo from './Promo';

export enum KelompokProduk {
  CICIL_KENDARAAN = 'CICIL_KENDARAAN',
  PINJAMAN_SERBAGUNA = 'PINJAMAN_SERBAGUNA',
  NON_LOS = 'NON_LOS',
}

@Entity('promo_microsite', { synchronize: false })
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
    type: 'enum',
    enum: KelompokProduk,
    nullable: true,
  })
  kelompok_produk: string;

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

  @OneToMany(() => PromoMicrositePhoto, (promoFoto) => promoFoto.promo_microsite, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  photos?: PromoMicrositePhoto[];

  @OneToMany(() => PromoBanner, (bannerPromo) => bannerPromo.promo_microsite, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  promo?: PromoBanner[];

  thumbnail?: string;
  promos?: Promo[];
}

export default PromoMicrosite;
