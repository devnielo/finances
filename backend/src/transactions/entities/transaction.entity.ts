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
import { Account } from '../../accounts/entities/account.entity';
import { Category } from '../../categories/entities/category.entity';

export enum TransactionType {
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
  TRANSFER = 'transfer',
  OPENING_BALANCE = 'opening-balance',
  RECONCILIATION = 'reconciliation',
}

@Entity('transactions')
@Index(['date'])
@Index(['amount'])
@Index(['sourceAccountId'])
@Index(['destinationAccountId'])
@Index(['categoryId'])
export class Transaction extends BaseEntity {
  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal', precision: 32, scale: 12 })
  amount: number;

  @Column({ length: 3, default: 'USD' })
  currencyCode: string;

  @Column({ type: 'decimal', precision: 32, scale: 12, nullable: true })
  foreignAmount?: number;

  @Column({ length: 3, nullable: true })
  foreignCurrencyCode?: string;

  @Column({ length: 1000 })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ length: 255, nullable: true })
  externalId?: string;

  @Column({ length: 255, nullable: true })
  internalReference?: string;

  @Column({ length: 255, nullable: true })
  externalUrl?: string;

  @Column({ type: 'date', nullable: true })
  processDate?: Date;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;

  @Column({ type: 'date', nullable: true })
  paymentDate?: Date;

  @Column({ type: 'date', nullable: true })
  invoiceDate?: Date;

  @Column({ type: 'decimal', precision: 32, scale: 12, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 32, scale: 12, nullable: true })
  longitude?: number;

  @Column({ default: false })
  reconciled: boolean;

  @Column({ type: 'int', default: 1 })
  order: number;

  @Column({ type: 'json', nullable: true })
  tags?: string[];

  @Column({ type: 'json', nullable: true })
  metadata?: {
    sepa?: {
      creditorId?: string;
      mandateId?: string;
      batchId?: string;
      endToEndId?: string;
    };
    importHash?: string;
    originalCurrency?: string;
    originalAmount?: number;
    exchangeRate?: number;
    merchant?: {
      name?: string;
      category?: string;
      location?: string;
    };
    card?: {
      last4?: string;
      type?: string;
    };
  };

  // Foreign Keys
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  sourceAccountId: string;

  @Column({ type: 'uuid' })
  destinationAccountId: string;

  @Column({ type: 'uuid', nullable: true })
  categoryId?: string;


  // Relations
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Account, (account) => account.sourceTransactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sourceAccountId' })
  sourceAccount: Account;

  @ManyToOne(() => Account, (account) => account.destinationTransactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'destinationAccountId' })
  destinationAccount: Account;

  @ManyToOne(() => Category, (category) => category.transactions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category?: Category;


  // Virtual fields
  get isWithdrawal(): boolean {
    return this.type === TransactionType.WITHDRAWAL;
  }

  get isDeposit(): boolean {
    return this.type === TransactionType.DEPOSIT;
  }

  get isTransfer(): boolean {
    return this.type === TransactionType.TRANSFER;
  }

  get formattedAmount(): string {
    const symbol = this.getCurrencySymbol();
    const amount = Number(this.amount).toFixed(2);
    return `${symbol} ${amount}`;
  }

  get absoluteAmount(): number {
    return Math.abs(Number(this.amount));
  }

  get isIncome(): boolean {
    return this.isDeposit || (this.isTransfer && Number(this.amount) > 0);
  }

  get isExpense(): boolean {
    return this.isWithdrawal || (this.isTransfer && Number(this.amount) < 0);
  }

  get hasLocation(): boolean {
    return !!(this.latitude && this.longitude);
  }

  get location(): { lat: number; lng: number } | null {
    if (!this.hasLocation) return null;
    return {
      lat: Number(this.latitude),
      lng: Number(this.longitude),
    };
  }

  get hasForeignCurrency(): boolean {
    return !!(this.foreignAmount && this.foreignCurrencyCode);
  }

  get exchangeRate(): number | null {
    if (!this.hasForeignCurrency) return null;
    return Number(this.amount) / Number(this.foreignAmount);
  }

  // Utility methods
  private getCurrencySymbol(): string {
    const currencySymbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CHF: 'CHF',
      CAD: 'C$',
      AUD: 'A$',
    };
    return currencySymbols[this.currencyCode] || this.currencyCode;
  }

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

  setLocation(latitude: number, longitude: number): void {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  clearLocation(): void {
    this.latitude = null;
    this.longitude = null;
  }

  // Validation methods
  isValid(): boolean {
    // Basic validation
    if (Number(this.amount) === 0) return false;
    if (!this.description.trim()) return false;
    if (!this.sourceAccountId || !this.destinationAccountId) return false;
    if (this.sourceAccountId === this.destinationAccountId) return false;
    
    return true;
  }

  // Transaction categorization
  isPending(): boolean {
    return !this.processDate || this.processDate > new Date();
  }

  isOverdue(): boolean {
    return !!(this.dueDate && this.dueDate < new Date() && !this.paymentDate);
  }

  isRecurring(): boolean {
    return false; // Will be implemented later with proper journal relationship
  }

  // Amount calculations for different transaction types
  getAmountForAccount(accountId: string): number {
    const amount = Number(this.amount);
    
    if (this.sourceAccountId === accountId) {
      return -Math.abs(amount); // Outgoing from source account
    }
    
    if (this.destinationAccountId === accountId) {
      return Math.abs(amount); // Incoming to destination account
    }
    
    return 0;
  }

  // Split transaction support
  getSplitTotal(): number {
    // If this transaction is part of a split, calculate the total
    // This would need to be implemented with proper split transaction logic
    return Number(this.amount);
  }
}