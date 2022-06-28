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

@Entity('mou')
class Mou {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instansi_id: number;

  @Column({
    type: 'int8',
    default: null,
  })
  outlet_id: number;

  @Column({
    type: 'int8',
    default: null,
  })
  user_assigned_id: number;

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

  @Column()
  created_by: number;

  @Column({ nullable: true })
  updated_by: number;

  @ManyToOne(() => Instansi)
  @JoinColumn([{ name: 'instansi_id', referencedColumnName: 'id' }])
  instansi: Instansi;

  @ManyToOne(() => Outlet)
  @JoinColumn([{ name: 'outlet_id', referencedColumnName: 'id' }])
  outlet: Outlet;

  @ManyToOne(() => User)
  @JoinColumn([{ name: 'user_assigned_id', referencedColumnName: 'id' }])
  user_assigned: User;

  @ManyToOne(() => User)
  @JoinColumn([{ name: 'created_by', referencedColumnName: 'id' }])
  user_created: User;
}

export default Mou;
