import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import MasterMenu from './MasterMenu';
import Role from './Role';

@Entity('access_menu_role', { synchronize: false })
class AccessMenuRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({})
  kode_role: string;

  @Column({})
  master_menu_id: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => MasterMenu, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn([{ name: 'master_menu_id', referencedColumnName: 'id' }])
  master_menu?: MasterMenu;

  @ManyToOne(() => Role)
  @JoinColumn([{ name: 'kode_role', referencedColumnName: 'kode' }])
  role: Role;
}

export default AccessMenuRole;
