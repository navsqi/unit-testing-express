import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('master_menu')
class MasterMenu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
    unique: true,
  })
  nama: string;

  @Column({
    length: 220,
  })
  description: string;

  @Column()
  parent_id: number;

  @Column({ type: 'text' })
  navigasi_url: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}

export default MasterMenu;
