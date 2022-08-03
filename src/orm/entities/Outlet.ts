import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('outlet')
class Outlet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 10,
    unique: true,
  })
  kode: string;

  @Column({
    length: 220,
  })
  nama: string;

  @Column({
    type: 'smallint',
  })
  unit_kerja: number;

  @Column({
    type: 'int4',
    nullable: true,
  })
  parent: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}

export default Outlet;
