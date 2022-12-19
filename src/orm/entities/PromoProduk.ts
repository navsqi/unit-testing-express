import { Column, 
  JoinColumn,
  CreateDateColumn,
  Entity, 
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
 } from 'typeorm';
import Promo from './Promo';

@Entity('promo_produk', { synchronize: false })
class PromoProduk {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 10,
    unique: true,
  })
  kode_produk: string;

  @Column({})
  promo_id: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  created_by: string;

  @Column()
  updated_by: string;

  @ManyToOne(() => Promo)
  @JoinColumn([{ name: 'promo_id', referencedColumnName: 'id' }])
  promo: Promo;
}

export default PromoProduk;
