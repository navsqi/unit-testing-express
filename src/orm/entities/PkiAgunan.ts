import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('pki_agunan', { synchronize: false })
class PkiAgunan {
  @PrimaryGeneratedColumn( )
  id: number;
  @Column({
    type:"varchar",
    length: 11,
    nullable: true,
  })
  no_pengajuan: string;

  @Column({
    type:"varchar",
    length: 10,
    nullable: true,
  })
  jenis_agunan: string

  @Column({
    type:"varchar",
    length: 5,
    nullable: true,  
  })
  jenis_kendaraan:string

  @Column({
    type:"varchar",
    length: 5,
    nullable: true,  
  })
  kondisi_kendaraan: string

  @Column({
    type:"int4",
    nullable: true,
  })
  tahun_produksi:number

  @Column({
    type:"double precision",
    nullable: true,
  })
  harga_kendaraan:number

  @Column({
    type:"double precision",
    nullable: true,
  })
  uang_muka: number

  @Column({
    type:"varchar",
    length: 20,
    nullable: true,
  })
  merk_kendaraan: string

  @Column({
    type:"varchar",
    length: 20,
    nullable: true,  
  })
  tipe_kendaraan: string

  @Column({
    type:"varchar",
    length: 50,
    nullable: true,  
  })
  no_sertifikat: string

  @Column({
    type:"varchar",
    nullable: true,  
  })
  kepemilikan_agunan: string
  
  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}

export default PkiAgunan;
