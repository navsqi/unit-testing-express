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
}

export default MasterMenu;
