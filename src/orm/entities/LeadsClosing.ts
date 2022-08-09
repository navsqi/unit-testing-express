import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('leads_closing')
class LeadsClosing {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    type: 'int4',
  })
  leads_id: number;

  @Column({
    length: 16,
    nullable: true,
  })
  nik_ktp: string;

  @Column({
    length: 11,
    nullable: true,
  })
  cif: string;

  @Column({
    length: 40,
    nullable: true,
  })
  no_kontrak: string;

  @Column({
    length: 20,
    nullable: true,
  })
  marketing_code: string;

  @Column({
    length: 20,
    nullable: true,
  })
  tgl_fpk: string;

  @Column({
    length: 20,
    nullable: true,
  })
  tgl_cif: string;

  @Column({
    length: 20,
    nullable: true,
  })
  tgl_kredit: string;

  @Column({
    length: 10,
    nullable: true,
  })
  kode_unit_kerja: string;

  @Column({
    length: 10,
    nullable: true,
  })
  kode_unit_kerja_pencairan: string;

  @Column({
    type: 'double precision',
    nullable: true,
  })
  up: number;

  @Column({
    length: 10,
    nullable: true,
  })
  outlet_syariah: string;

  @Column({
    type: 'smallint',
    nullable: true,
    default: 0,
  })
  status_new_cif: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;
}

export default LeadsClosing;
