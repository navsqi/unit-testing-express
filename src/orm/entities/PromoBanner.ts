import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import PromoMicrosite from './PromoMicrosite';
import Promo from './Promo';

@Entity('promo_banner', { synchronize: true })
class PromoBanner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  promo_microsite_id: string;

  @Column({
    type: 'varchar',
  })
  promo_id: string;

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

  @ManyToOne(() => PromoMicrosite)
  @JoinColumn([{ name: 'promo_microsite_id', referencedColumnName: 'id' }])
  promo_microsite: PromoMicrosite;

  @ManyToOne(() => Promo)
  @JoinColumn([{ name: 'promo_id', referencedColumnName: 'id' }])
  promo: Promo;
}

export default PromoBanner;
