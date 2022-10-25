import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('organisasi_pegawai', { synchronize: false })
class OrganisasiPegawai {
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

export default OrganisasiPegawai;
