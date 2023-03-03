import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('event_history', { synchronize: true })
class EventHistory {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    length: 10,
  })
  nik_user: string;

  @Column({
    length: 50,
  })
  event_type: string;

  @Column({
    length: 50,
  })
  action_type: string;

  @Column()
  @CreateDateColumn()
  created_at?: Date;
}

export default EventHistory;
