import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('access_menu_role')
class AccessMenuRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({})
  role_id: number;

  @Column({})
  master_menu_id: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}

export default AccessMenuRole;
