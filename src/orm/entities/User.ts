import bcrypt from 'bcryptjs';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import AssignmentInstansi from './AssignmentInstansi';
import Outlet from './Outlet';
import Role from './Role';

@Entity('users', { synchronize: false })
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  nik: string;

  @Column({})
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    nullable: true,
  })
  nama: string;

  @Column({
    nullable: true,
  })
  photo: string;

  @Column({
    length: 12,
    nullable: true,
    unique: false,
  })
  kode_role: string;

  @Column({
    length: 10,
    nullable: true,
    unique: false,
  })
  kode_unit_kerja: string;

  @Column({
    type: 'smallint',
    default: 1,
  })
  is_approved: number;

  @Column({
    type: 'smallint',
    default: 1,
  })
  is_active: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp' })
  last_login: Date;

  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfPasswordMatch(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }

  @ManyToOne(() => Role)
  @JoinColumn([{ name: 'kode_role', referencedColumnName: 'kode' }])
  role: Role;

  @ManyToOne(() => Outlet)
  @JoinColumn([{ name: 'kode_unit_kerja', referencedColumnName: 'kode' }])
  unit_kerja: Outlet;

  @OneToOne(() => AssignmentInstansi)
  @JoinColumn([{ name: 'nik', referencedColumnName: 'user_nik' }])
  assignment_instansi: AssignmentInstansi;
}

export default User;
