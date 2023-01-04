import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import Produk from './Produk';
import PromoMicrosite from './PromoMicrosite';
import PromoVoucher from './PromoVoucher';

export enum JenisPromosi {
  TUNAI = 'TUNAI',
  CASHBACK = 'CASHBACK',
  TRANSFER = 'TRANSFER',
}

export enum TipeTransaksi {
  FIXED = 'FIXED',
  NON_FIXED = 'NON_FIXED',
}

export enum JenisVoucher {
  TANPA_VOUCHER = 'TANPA_VOUCHER',
  SEKALI_PAKAI = 'SEKALI_PAKAI',
  MULTI_PAKAI = 'MULTI_PAKAI',
}

export enum JenisTransaksi {
  BOOKING = 'BOOKING',
  NON_BOOKING = 'NON_BOOKING',
}

export enum TipeNasabah {
  NASABAH_BARU = 'NASABAH_BARU',
  SEMUA_NASABAH = 'SEMUA_NASABAH',
}
export enum TipePromosi {
  UANG_PINJAMAN = 'UANG_PINJAMAN',
  MINTA_TAMBAH = 'MINTA_TAMBAH',
  TRANSAKSI_NON_OSL = 'TRANSAKSI_NON_OSL',
}

export enum TipeAlokasi {
  PUSAT = 'PUSAT',
}

@Entity('promo', { synchronize: false })
class Promo {
  @PrimaryColumn({
    type: 'varchar',
  })
  id: string;

  @Column()
  nama_promosi: string;

  @Column({
    type: 'varchar',
    length: 11,
  })
  kode_produk: string;

  @Column({
    type: 'enum',
    enum: JenisPromosi,
  })
  jenis_promosi: string;

  @Column({
    type: 'enum',
    enum: TipeTransaksi,
  })
  tipe_transaksi: string;

  @Column({
    type: 'enum',
    enum: JenisVoucher,
  })
  jenis_voucher: string;

  @Column({
    type: 'enum',
    enum: JenisTransaksi,
  })
  jenis_transaksi: string;

  @Column({
    type: 'enum',
    enum: TipeNasabah,
    nullable: true,
  })
  tipe_nasabah: string;

  @Column({
    type: 'enum',
    enum: TipePromosi,
    nullable: true,
  })
  tipe_promosi: string;

  @Column({
    type: 'date',
  })
  start_date: string;

  @Column({
    type: 'date',
  })
  end_date: string;

  @Column({
    type: 'double precision',
  })
  total_promosi: number;

  @Column({
    type: 'double precision',
    nullable: true,
  })
  nilai_per_transaksi: number;

  @Column({
    type: 'enum',
    enum: TipeAlokasi,
  })
  tipe_alokasi: string;

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

  @OneToOne(() => Produk)
  @JoinColumn([{ name: 'kode_produk', referencedColumnName: 'kode_produk' }])
  produk: Produk;

  @OneToMany(() => PromoMicrosite, (micro) => micro.promo_id)
  promo_microsite?: PromoMicrosite[];

  @OneToMany(() => PromoVoucher, (pv) => pv.promo)
  promo_voucher?: PromoVoucher[];
}

export default Promo;