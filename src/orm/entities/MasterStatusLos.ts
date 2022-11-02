import { Column, Entity, PrimaryColumn, Table } from 'typeorm';

@Entity('master_status_los', { synchronize: false })
class MasterStatusLos {
  @Column({
    length: 20,
  })
  @PrimaryColumn()
  status_los: string;

  @Column({
    length: 20,
    nullable: true,
  })
  id_status_microsite: string;

  @Column({
    length: 200,
  })
  deskripsi_status_los: string;
}

export default MasterStatusLos;
