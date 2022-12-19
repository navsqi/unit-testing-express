import { 
  Column, 
  CreateDateColumn, 
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn, 
  UpdateDateColumn }
  from 'typeorm';
import PromoMicrosite from './PromoMicrosite';

@Entity('promo_microsite_photo', { synchronize: false })
class PromoMicrositePhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({})
  photo: string;

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
  @JoinColumn([{ name: 'id', referencedColumnName: 'id' }])
  promo_microsite: PromoMicrosite;
}

export default PromoMicrositePhoto;
