import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('params_sso_role', { synchronize: false })
class ParamsSsoRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 10,
  })
  prefix: string;

  @Column({
    length: 10,
  })
  mapping: string;
}

export default ParamsSsoRole;
