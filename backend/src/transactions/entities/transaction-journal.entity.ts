import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Transaction } from './transaction.entity';

export enum TransactionJournalType {
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
  TRANSFER = 'transfer',
  OPENING_BALANCE = 'opening-balance',
  RECONCILIATION = 'reconciliation',
}

@Entity('transaction_journals')
@Index(['date'])
@Index(['description'])
export class TransactionJournal extends BaseEntity {
  @Column({
    type: 'enum',
    enum: TransactionJournalType,
  })
  type: TransactionJournalType;

  @Column({ type: 'date' })
  date: Date;

  @Column({ length: 1000 })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ length: 255, nullable: true })
  externalId?: string;

  @Column({ length: 255, nullable: true })
  internalReference?: string;

  @Column({ default: false })
  reconciled: boolean;

  @Column({ type: 'int', default: 1 })
  order: number;

  @Column({ type: 'json', nullable: true })
  tags?: string[];

  @Column({ type: 'json', nullable: true })
  metadata?: {
    importHash?: string;
    originalSource?: string;
    splitGroup?: string;
    recurrenceId?: string;
    billId?: string;
  };

  // Foreign Keys
  @Column({ type: 'uuid' })
  userId: string;

  // Relations
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Transaction, transaction => transaction.journal, {
    cascade: true,
    eager: false,
  })
  transactions: Transaction[];

  // Journal operations
  addTag(tag: string): void {
    if (!this.tags) {
      this.tags = [];
    }
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    if (this.tags) {
      this.tags = this.tags.filter(t => t !== tag);
    }
  }

  hasTag(tag: string): boolean {
    return this.tags?.includes(tag) || false;
  }

  // Basic validation
  isValid(): boolean {
    if (!this.description.trim()) return false;
    return true;
  }
}