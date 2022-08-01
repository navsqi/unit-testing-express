import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Event from './Event';
import Instansi from './Instansi';
import Outlet from './Outlet';
import User from './User';

// instansi_id: bodies.instansi_id,
// event_id: bodies.event_id,
// nik_ktp: row[1],
// nama: row[0],
// no_hp: row[2],
// up: row[3],
// kode_produk: row[4],
// nik_ktp_karyawan: row[5],
// created_by: req.user.nik,

@Entity('leads')
class Leads {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    type: 'int4',
  })
  event_id: number;

  @Column({
    type: 'int4',
  })
  instansi_id: number;

  @Column({
    length: 100,
  })
  nama: string;

  @Column({
    length: 16,
    nullable: true,
  })
  nik_ktp: string;

  @Column({
    length: 16,
    nullable: true,
  })
  no_hp: string;

  @Column({
    type: 'double precision',
    nullable: true,
  })
  up?: number;

  @Column({
    length: 10,
    nullable: true,
  })
  kode_produk: string;

  @Column({
    type: 'varchar',
    length: 10,
  })
  kode_unit_kerja: string;

  @Column({
    length: 16,
    nullable: true,
  })
  source_data: string;

  @Column({
    type: 'smallint',
    default: 0,
  })
  is_ktp_valid?: number;

  @Column({
    nullable: true,
    type: 'date',
  })
  expired_referral: string;

  @Column({
    type: 'double precision',
    nullable: true,
  })
  up_realisasi: number;

  @Column({
    nullable: true,
    type: 'date',
  })
  tanggal_realisasi: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  kode_unit_kerja_realisasi: string;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 10,
    default: 'CLP',
  })
  step: string;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 255,
  })
  description: string;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 11,
  })
  cif: string;

  @Column({
    nullable: true,
    type: 'date',
  })
  cif_created_at: string;

  @Column({
    length: 20,
    nullable: true,
  })
  no_kontrak: string;

  @Column({
    type: 'smallint',
    default: 0,
  })
  is_badan_usaha: number;

  @Column({
    type: 'smallint',
    default: 0,
  })
  is_new_cif: number;

  @Column({
    type: 'smallint',
    default: 0,
  })
  status: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'KAMILA',
  })
  flag_app: string;

  @Column({
    length: 16,
    nullable: true,
  })
  nik_ktp_karyawan: string;

  @Column({
    type: 'smallint',
    default: 0,
  })
  is_karyawan: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @Column({
    type: 'varchar',
    length: 15,
    nullable: true,
  })
  created_by: string;

  @Column({
    type: 'varchar',
    length: 15,
    nullable: true,
  })
  updated_by: string;

  @ManyToOne(() => Event)
  @JoinColumn([{ name: 'event_id', referencedColumnName: 'id' }])
  event: Event;

  @ManyToOne(() => Instansi)
  @JoinColumn([{ name: 'instansi_id', referencedColumnName: 'id' }])
  instansi: Instansi;

  @ManyToOne(() => Outlet)
  @JoinColumn([{ name: 'kode_unit_kerja', referencedColumnName: 'kode' }])
  outlet: Outlet;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'NO ACTION' })
  @JoinColumn([{ name: 'created_by', referencedColumnName: 'nik' }])
  user_created: User;
}

export default Leads;
