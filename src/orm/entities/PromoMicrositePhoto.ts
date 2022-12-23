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

@Entity('promo_microsite_photo', { synchronize: true })
class PromoMicrositePhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({})
  promo_microsite_id: number;

  @Column({})
  photo: string;

  @Column({
    type: 'bool',
    default: false,
  })
  is_thumbnail: boolean;

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

  @ManyToOne(() => PromoMicrosite)
  @JoinColumn([{ name: 'promo_microsite_id', referencedColumnName: 'id' }])
  promo_microsite: PromoMicrosite;
}

export default PromoMicrositePhoto;
