import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('sarana_media', { synchronize: false })
class SaranaMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 200,
  })
  deskripsi: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}

export default SaranaMedia;
