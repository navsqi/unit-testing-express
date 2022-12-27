import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Promo from './Promo';

@Entity('promo_voucher', { synchronize: false })
class PromoVoucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  kode_voucher: string;

  @Column({
    type: 'varchar',
  })
  promo_id: string;

  @Column({
    type: 'double precision',
    nullable: true,
  })
  total_promosi: number;

  @Column({
    type: 'date',
  })
  start_date: string;

  @Column({
    type: 'date',
  })
  end_date: string;

  @Column({
    type: 'int4',
  })
  jumlah_voucher: number;

  @Column({
    type: 'double precision',
  })
  potongan_rp: number;

  @Column({
    type: 'varchar',
  })
  tempat: string;

  @Column({
    type: 'double precision',
  })
  potongan_persentase: number;

  @Column({
    type: 'double precision',
  })
  minimal_rp: number;

  @Column({
    type: 'double precision',
  })
  maksimal_rp: number;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  kode_booking: string;

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

  @Column({ nullable: true })
  updated_by: string;

  @ManyToOne(() => Promo)
  @JoinColumn([{ name: 'promo_id', referencedColumnName: 'id' }])
  promo?: Promo;
}

export default PromoVoucher;
