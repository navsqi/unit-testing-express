import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('master_status_pki', { synchronize: false })
class MasterStatusPki {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
  })
  name: string;
  
  @Column({
    length: 20,
    nullable: true,
  })
  value: string;
  
  @Column({
    length: 200,
  })
  label: string;
  
  @Column({
  })
  no_urut: number;

  @Column({
    length: 20,
    nullable: true
  })
  status_los: string;
}

export default MasterStatusPki;
