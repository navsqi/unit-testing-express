import bcrypt from 'bcryptjs';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
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
    length: 100,
    nullable: true,
  })
  role: string;

  @Column({
    length: 12,
    nullable: true,
  })
  kode_role: string;

  @Column({
    length: 100,
    nullable: true,
  })
  unit_kerja: string;

  @Column({
    length: 12,
    nullable: true,
  })
  kode_unit_kerja: string;

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

  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfPasswordMatch(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}

export default User;
