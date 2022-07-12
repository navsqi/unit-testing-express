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
import User from './User';

@Entity('assignment_instansi')
class AssignmentInstansi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({})
  instansi_id: number;

  @Column({
    type: 'varchar',
    length: 10,
  })
  user_nik: string;

  @Column({
    type: 'varchar',
    length: 10,
  })
  assignor_nik: string;

  @Column({
    type: 'smallint',
    default: 1,
  })
  status_aktif: number;

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

  @ManyToOne(() => User)
  @JoinColumn([{ name: 'user_nik', referencedColumnName: 'nik' }])
  user: User;

  @ManyToOne(() => User)
  @JoinColumn([{ name: 'assignor_nik', referencedColumnName: 'nik' }])
  assignor: User;
}

export default AssignmentInstansi;
