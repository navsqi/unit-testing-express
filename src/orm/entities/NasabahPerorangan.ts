import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('nasabah_perorangan')
class NasabahPerorangan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 16,
    nullable: true,
  })
  nik: string;

  @Column({
    length: 80,
    nullable: true,
  })
  nama: string;

  @Column({
    length: 16,
    nullable: true,
  })
  no_kk: string;

  @Column({
    length: 12,
    nullable: true,
  })
  cif: string;

  @Column({
    length: 100,
    nullable: true,
  })
  source_data: string;

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
}

export default NasabahPerorangan;
