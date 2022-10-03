import { Column, Entity } from 'typeorm';

@Entity('tmp_kredit', { synchronize: false })
class TmpKredit {
  @Column({
    length: 16,
    nullable: true,
  })
  nik: string;

  @Column({
    length: 20,
    nullable: true,
  })
  no_kontrak: string;

  @Column({
    length: 20,
    nullable: true,
  })
  product_code: string;

  @Column({
    length: 20,
    nullable: true,
  })
  up: string;

  @Column({
    length: 20,
    nullable: true,
  })
  tgl_kredit: Date;

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
  kode_outlet: string;

  @Column({
    length: 20,
    nullable: true,
  })
  cif: string;

  @Column({
    length: 20,
    nullable: true,
  })
  outlet_syariah: string;

  @Column({
    length: 20,
    nullable: true,
  })
  channel_id: string;

  @Column({
    length: 20,
    nullable: true,
  })
  nama_channel: string;

  @Column({
    length: 20,
    nullable: true,
  })
  osl: number;

  @Column({
    length: 20,
    nullable: true,
  })
  saldo_tabemas: number;
}

export default TmpKredit;
