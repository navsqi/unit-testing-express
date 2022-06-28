import bcrypt from 'bcryptjs';
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

@Entity('users')
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  nik: string;

  @Column({})
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    nullable: true,
  })
  username: string;

  @Column({
    nullable: true,
  })
  name: string;

  @Column({
    nullable: true,
  })
  photo: string;

  @Column({
    length: 70,
    nullable: true,
  })
  role: string;

  @Column({
    length: 70,
    nullable: true,
  })
  grade: string;

  @Column({
    length: 6,
    nullable: true,
  })
  kode_unit_kerja: string;

  @Column({
    type: 'smallint',
    default: 1,
  })
  is_approved: number;

  @Column({
    type: 'int8',
    default: null,
  })
  outlet_id: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Outlet)
  @JoinColumn([{ name: 'outlet_id', referencedColumnName: 'id' }])
  cakupan_instansi: Outlet;

  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfPasswordMatch(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}

export default User;
