import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ShortUrl {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: number;

  @Index({ unique: true })
  @Column({ length: 8 })
  key!: string;

  @Column({ nullable: true, type: 'timestamptz' })
  lockedUntil: Date | null = null;
}
