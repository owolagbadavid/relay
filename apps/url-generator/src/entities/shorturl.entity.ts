import { Column, Index, PrimaryGeneratedColumn } from 'typeorm';

export class ShortUrl {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: number;

  @Index({ unique: true })
  @Column({ length: 8 })
  key!: string;

  @Column()
  lockedUntil: Date | null = null;

  @Column()
  isInUse: boolean = false;
}
