import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('master_rubrik_agunan', { synchronize: false })
class MasterRubrikAgunan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
  })
  kode: string;

  @Column({
    length: 20,
    nullable: true,
  })
  prefix: string;

  @Column({
    length: 100,
  })
  label: string;

  @Column({})
  no_urut: number;
}

export default MasterRubrikAgunan;
