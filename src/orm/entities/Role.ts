import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import AccessMenuRole from './AccessMenuRole';

@Entity('role')
class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 10,
    unique: true,
  })
  kode: string;

  @Column({
    length: 220,
  })
  nama: string;

  @Column({ nullable: true })
  keterangan: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => AccessMenuRole, (amr) => amr.role)
  access_menu_role: AccessMenuRole[];
}

export default Role;
