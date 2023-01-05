import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import AssignmentInstansi from './AssignmentInstansi';
import MasterInstansi, { JenisInstansi } from './MasterInstansi';
import OrganisasiPegawai from './OrganisasiPegawai';
import Outlet from './Outlet';
import SaranaMedia from './SaranaMedia';
import User from './User';

export const JENIS_INSTANSI = {
  PEMERINTAH: '01',
  BUMN: '02',
  SWASTA: '03',
  KOMUNITAS: '04',
};

@Entity('instansi', { synchronize: false })
class Instansi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50,
    nullable: true,
  })
  kode_instansi: string;

  @Column({
    type: 'int8',
  })
  master_instansi_id: number;

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
    length: 10,
  })
  kode_unit_kerja: string;

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
  sarana_media_id: string;

  @Column()
  organisasi_pegawai_id: number;

  @Column({
    type: 'double precision',
  })
  scoring_instansi: number;

  @Column({
    nullable: true,
  })
  status_potensial: string;

  @Column({
    nullable: true,
    enum: ['BINAAN', 'NON BINAAN'],
    default: 'BINAAN',
  })
  kategori_instansi: string;

  @Column({
    type: 'smallint',
    default: 0,
  })
  is_approved: number;

  @Column({
    type: 'boolean',
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

  @Column('text', { array: true, default: [] })
  unit_assign: string;

  @ManyToOne(() => MasterInstansi)
  @JoinColumn([{ name: 'master_instansi_id', referencedColumnName: 'id' }])
  master_instansi: MasterInstansi;

  @ManyToOne(() => SaranaMedia)
  @JoinColumn([{ name: 'sarana_media_id', referencedColumnName: 'id' }])
  sarana_media: SaranaMedia;

  @ManyToOne(() => OrganisasiPegawai)
  @JoinColumn([{ name: 'organisasi_pegawai_id', referencedColumnName: 'id' }])
  organisasi_pegawai: OrganisasiPegawai;

  @ManyToOne(() => Outlet)
  @JoinColumn([{ name: 'kode_unit_kerja', referencedColumnName: 'kode' }])
  cakupan_instansi: Outlet;

  @OneToMany(() => AssignmentInstansi, (assignmentInstansi) => assignmentInstansi.instansi)
  assignment_instansi: Outlet;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'NO ACTION' })
  @JoinColumn([{ name: 'created_by', referencedColumnName: 'nik' }])
  user_created: User;
}

export default Instansi;
