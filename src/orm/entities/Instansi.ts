import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import MasterInstansi, { JenisInstansi } from './MasterInstansi';

@Entity('instansi')
class Instansi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    type: 'int8',
  })
  master_instansi_id: number;

  @Column({
    unique: true,
    type: 'int8',
  })
  @ManyToOne(() => MasterInstansi)
  @JoinColumn([{ name: 'master_instansi_id', referencedColumnName: 'id' }])
  master_instansi: MasterInstansi;

  @Column({
    unique: true,
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
    unique: true,
    length: 100,
  })
  email: string;

  @Column({
    nullable: true,
    length: 13,
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
    length: 60,
  })
  cakupan_instansi: string;

  @Column({
    nullable: true,
    type: 'date',
  })
  tanggal_berdiri_instansi: string;

  @Column({
    type: 'int4',
  })
  jumlah_pegawai: number;

  @Column({
    type: 'int4',
  })
  jumlah_pelanggan: number;

  @Column({
    type: 'int4',
  })
  jumlah_kantor_cabang: number;

  @Column({
    type: 'int4',
  })
  jumlah_kerjasama: number;

  @Column()
  sarana_media: string;

  @Column()
  organisasi: string;

  @Column({
    type: 'double precision',
  })
  scoring_instansi: number;

  @Column({
    type: 'smallint',
  })
  status_potensial: number;

  @Column({
    type: 'smallint',
    default: 0,
  })
  is_approved: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  created_by: number;

  @Column()
  updated_by: number;
}

export default Instansi;
