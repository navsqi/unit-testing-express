import { Column, Entity } from 'typeorm';

@Entity('tmp_top_up_tabemas', { synchronize: false })
class TmpTopupTabemas {
  @Column({
    length: 20,
    nullable: true,
  })
  product_code: string;

  @Column({
    length: 16,
    nullable: true,
  })
  nik: string;

  @Column({
    length: 20,
    nullable: true,
  })
  no_rekening: string;

  @Column({
    length: 20,
    nullable: true,
  })
  kode_outlet: string;

  @Column({
    length: 20,
    nullable: true,
  })
  marketing_code: string;

  @Column({
    length: 20,
    nullable: true,
  })
  tgl_trx: Date;

  @Column({
    length: 20,
    nullable: true,
  })
  tgl_cif: Date;

  @Column({
    length: 20,
    nullable: true,
  })
  berat: number;

  @Column({
    length: 20,
    nullable: true,
  })
  amount_per_gram: number;

  @Column({
    length: 20,
    nullable: true,
  })
  up: number;

  @Column({
    length: 20,
    nullable: true,
  })
  cif: string;

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

export default TmpTopupTabemas;
