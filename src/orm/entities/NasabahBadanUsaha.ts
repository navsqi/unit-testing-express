import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('nasabah_badan_usaha')
class NasabahBadanUsaha {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 80,
  })
  cif: string;

  @Column({
    length: 80,
  })
  nama: string;

  @Column({
    length: 16,
    nullable: true,
  })
  nik_pic: string;

  @Column({
    length: 16,
    nullable: true,
  })
  nama_pic: string;

  @Column({
    length: 16,
    nullable: true,
  })
  no_telp: string;

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

export default NasabahBadanUsaha;
