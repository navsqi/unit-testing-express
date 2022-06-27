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
}

export enum CakupanInstansi {
  PUSAT = 'PUSAT',
  WILAYAH = 'WILAYAH',
  AREA = 'AREA',
  CABANG = 'CABANG',
}

@Entity('master_instansi')
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
    type: 'int4',
  })
  outlet_id: number;

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
  created_by: number;

  @Column({ nullable: true })
  updated_by: number;

  @ManyToOne(() => Outlet)
  @JoinColumn([{ name: 'outlet_id', referencedColumnName: 'id' }])
  cakupan_instansi: Outlet;
}

export default MasterInstansi;
