import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Outlet from './Outlet';

export enum JenisInstansi {
  PEMERINTAH = 'PEMERINTAH',
  SWASTA = 'SWASTA',
  BUMN = 'BUMN',
  KOMUNITAS = 'KOMUNITAS',
}

export enum CakupanInstansi {
  PUSAT = 'PUSAT',
  WILAYAH = 'WILAYAH',
  AREA = 'AREA',
  CABANG = 'CABANG',
}

@Entity('master_instansi', { synchronize: false })
class MasterInstansi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 80,
  })
  nama_instansi: string;

  @Column({
    type: 'enum',
    nullable: true,
    enum: JenisInstansi,
  })
  jenis_instansi: JenisInstansi;

  @Column({ nullable: true })
  alamat: string;

  @Column({
    nullable: true,
    length: 100,
  })
  email: string;

  @Column({
    nullable: true,
    length: 15,
  })
  no_telepon_instansi: string;

  @Column({
    nullable: true,
    length: 60,
  })
  nama_karyawan: string;

  @Column({
    nullable: true,
    length: 60,
  })
  no_telepon_karyawan: string;

  @Column({
    nullable: true,
    length: 60,
  })
  email_karyawan: string;

  @Column({
    nullable: true,
    length: 60,
  })
  jabatan_karyawan: string;

  @Column({
    type: 'varchar',
  })
  kode_unit_kerja: number;

  @Column({
    type: 'smallint',
    default: 1,
  })
  is_approved: number;

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

  @ManyToOne(() => Outlet)
  @JoinColumn([{ name: 'kode_unit_kerja', referencedColumnName: 'kode' }])
  cakupan_instansi: Outlet;
}

export default MasterInstansi;
