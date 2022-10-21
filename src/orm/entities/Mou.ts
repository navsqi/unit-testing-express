import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Instansi from './Instansi';
import Outlet from './Outlet';
import User from './User';

export enum JenisKerjasama {
  MOU = 'MOU',
  PKS = 'PKS',
}

export enum StatusMou {
  PENGAJUAN = 'PENGAJUAN',
  DITERIMA = 'DITERIMA',
  DITOLAK = 'DITOLAK',
}

@Entity('mou', { synchronize: false })
class Mou {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansi_id: number;

  @Column({
    type: 'varchar',
    default: null,
  })
  kode_unit_kerja: string;

  @Column({
    type: 'varchar',
    length: 100,
    default: null,
  })
  nama_pic: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: JenisKerjasama,
  })
  jenis_kerjasama: string;

  @Column()
  nomor_kerjasama: string;

  @Column()
  nama_kerjasama: string;

  @Column({
    enum: StatusMou,
    type: 'enum',
    default: 'PENGAJUAN',
  })
  status: StatusMou;

  @Column({
    nullable: true,
    type: 'text',
  })
  deskripsi: string;

  @Column({
    type: 'date',
  })
  start_date: string;

  @Column({
    type: 'date',
  })
  end_date: string;

  @Column({
    type: 'varchar',
    default: null,
  })
  file: string;

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

export default Mou;
