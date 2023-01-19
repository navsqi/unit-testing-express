import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('pki_nasabah', { synchronize: false })
class PkiNasabah {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 16,
  })
  no_ktp: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  nama: string;

  @Column({
    type: 'date',
  })
  tgl_lahir: Date;

  @Column({
    type: 'varchar',
    length: 15,
  })
  no_hp: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  email: string;

  @Column({ type: 'timestamp' })
  @CreateDateColumn()
  created_date: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  modified_date: Date;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  file_path_ektp: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  jenis_pekerjaan: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  status_pekerjaan: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  masa_kerja: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  jumlah_tanggungan: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  status_perkawinan: string;

  @Column({
    type: 'double precision',
    nullable: true,
  })
  penghasilan: number;

  @Column({
    type: 'double precision',
    nullable: true,
  })
  pengeluaran: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  data_consent: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}

export default PkiNasabah;
