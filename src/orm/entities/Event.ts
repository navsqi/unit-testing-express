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

@Entity('event')
class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int4',
  })
  instansi_id: number;

  @Column({
    type: 'varchar',
    length: 10,
  })
  kode_unit_kerja: string;

  @Column({
    length: 100,
  })
  jenis_event: string;

  @Column({
    length: 100,
  })
  nama_event: string;

  @Column({
    length: 255,
    nullable: true,
  })
  keterangan: string;

  @Column({
    type: 'date',
  })
  tanggal_event: string;

  @Column({
    type: 'varchar',
  })
  nama_pic: string;

  @Column({
    type: 'varchar',
    length: 15,
  })
  nomor_hp_pic: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  foto_dokumentasi: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'KAMILA',
  })
  flag_app: string;

  @Column({
    type: 'smallint',
    default: 0,
  })
  status: number;

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

  @ManyToOne(() => Outlet)
  @JoinColumn([{ name: 'kode_unit_kerja', referencedColumnName: 'kode' }])
  outlet: Outlet;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'NO ACTION' })
  @JoinColumn([{ name: 'created_by', referencedColumnName: 'nik' }])
  user_created: User;

  @ManyToOne(() => Instansi)
  @JoinColumn([{ name: 'instansi_id', referencedColumnName: 'id' }])
  instansi: Instansi;
}

export default Event;
