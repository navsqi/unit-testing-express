import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import User from './User';

@Entity('produk', { synchronize: false })
class Produk {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    default: null,
    length: 10,
    unique: true,
  })
  kode_produk: string;

  @Column({
    type: 'varchar',
    default: null,
    length: 100,
  })
  nama_produk: string;

  @Column({
    default: true,
  })
  is_active: boolean;

  @Column({
    type: 'varchar',
    default: null,
    length: 100,
  })
  tipe: string;

  @Column({
    type: 'varchar',
    default: null,
    length: 100,
  })
  basic_produk: string;

  @Column({
    default: false,
  })
  egc: boolean;

  @Column({
    default: false,
  })
  bpo: boolean;

  @Column({
    default: false,
  })
  ro: boolean;

  @Column({
    default: false,
  })
  cst: boolean;

  @Column({
    type: 'varchar',
    default: null,
    length: 100,
  })
  kategori_egc: string;

  @Column({
    default: false,
  })
  fronting: boolean;

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

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'NO ACTION' })
  @JoinColumn([{ name: 'created_by', referencedColumnName: 'nik' }])
  user_created: User;
}

export default Produk;
