import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import AccessMenuRole from './AccessMenuRole';

@Entity('master_menu', { synchronize: false })
class MasterMenu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
  })
  nama: string;

  @Column({
    length: 220,
    nullable: true,
  })
  description: string;

  @Column()
  parent_id: number;

  @Column({ type: 'text' })
  navigasi_url: string;

  @Column()
  unit_kerja: string;

  @Column()
  orders: number;

  @Column({ default: false })
  child: boolean;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => AccessMenuRole, (amr) => amr.master_menu, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  access_menu_role: AccessMenuRole[];
}

export default MasterMenu;
