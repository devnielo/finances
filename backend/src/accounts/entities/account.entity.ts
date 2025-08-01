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
import { Transaction } from '../../transactions/entities/transaction.entity';

export enum AccountType {
  ASSET = 'asset',
  EXPENSE = 'expense',
  REVENUE = 'revenue',
  LIABILITY = 'liability',
  INITIAL_BALANCE = 'initial-balance',
  RECONCILIATION = 'reconciliation',
}

export enum AccountRole {
  DEFAULT_ASSET = 'defaultAsset',
  SHARED_ASSET = 'sharedAsset',
  SAVING_ASSET = 'savingAsset',
  CC_ASSET = 'ccAsset',
  CASH_WALLET = 'cashWallet',
}

@Entity('accounts')
@Index(['name', 'userId'], { unique: true })
@Index(['accountNumber'])
@Index(['iban'])
export class Account extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: AccountType,
  })
  type: AccountType;

  @Column({
    type: 'enum',
    enum: AccountRole,
    nullable: true,
  })
  role?: AccountRole;

  @Column({ length: 50, nullable: true })
  accountNumber?: string;

  @Column({ length: 34, nullable: true })
  iban?: string;

  @Column({ length: 11, nullable: true })
  bic?: string;

  @Column({ type: 'decimal', precision: 32, scale: 12, default: 0 })
  currentBalance: number;

  @Column({ type: 'decimal', precision: 32, scale: 12, default: 0 })
  virtualBalance: number;

  @Column({ length: 3, default: 'USD' })
  currencyCode: string;

  @Column({ length: 1, nullable: true })
  currencySymbol?: string;

  @Column({ type: 'int', default: 2 })
  currencyDecimalPlaces: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: true })
  includeNetWorth: boolean;

  @Column({ type: 'decimal', precision: 32, scale: 12, nullable: true })
  creditLimit?: number;

  @Column({ type: 'decimal', precision: 32, scale: 12, nullable: true })
  monthlyPaymentDate?: number;

  @Column({ type: 'decimal', precision: 32, scale: 12, nullable: true })
  liability?: number;

  @Column({ type: 'decimal', precision: 32, scale: 12, nullable: true })
  interest?: number;

  @Column({
    type: 'enum',
    enum: ['daily', 'monthly', 'yearly'],
    nullable: true,
  })
  interestPeriod?: string;

  @Column({ type: 'date', nullable: true })
  openingDate?: Date;

  @Column({ type: 'date', nullable: true })
  closingDate?: Date;

  @Column({ type: 'int', default: 1 })
  order: number;

  @Column({ type: 'json', nullable: true })
  metadata?: {
    bank?: string;
    branch?: string;
    accountHolder?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
    color?: string;
    icon?: string;
  };

  // Foreign Keys
  @Column({ type: 'uuid' })
  userId: string;

  // Relations
  @ManyToOne(() => User, (user) => user.accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.sourceAccount)
  sourceTransactions: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.destinationAccount)
  destinationTransactions: Transaction[];

  // Virtual fields
  get displayName(): string {
    return this.name;
  }

  get isAsset(): boolean {
    return this.type === AccountType.ASSET;
  }

  get isExpense(): boolean {
    return this.type === AccountType.EXPENSE;
  }

  get isRevenue(): boolean {
    return this.type === AccountType.REVENUE;
  }

  get isLiability(): boolean {
    return this.type === AccountType.LIABILITY;
  }

  get formattedBalance(): string {
    const symbol = this.currencySymbol || this.currencyCode;
    const balance = Number(this.currentBalance).toFixed(this.currencyDecimalPlaces);
    return `${symbol} ${balance}`;
  }

  get availableBalance(): number {
    if (this.isAsset && this.creditLimit) {
      return Number(this.currentBalance) + Number(this.creditLimit);
    }
    return Number(this.currentBalance);
  }

  get isOverdrawn(): boolean {
    return this.isAsset && Number(this.currentBalance) < 0;
  }

  get isNearCreditLimit(): boolean {
    if (!this.isAsset || !this.creditLimit) {
      return false;
    }
    const usedCredit = Math.abs(Math.min(0, Number(this.currentBalance)));
    const creditUtilization = usedCredit / Number(this.creditLimit);
    return creditUtilization >= 0.8; // 80% of credit limit
  }

  // Balance operations
  updateBalance(amount: number): void {
    this.currentBalance = Number(this.currentBalance) + amount;
    this.calculateVirtualBalance();
  }

  setBalance(amount: number): void {
    this.currentBalance = amount;
    this.calculateVirtualBalance();
  }

  private calculateVirtualBalance(): void {
    // Virtual balance includes pending transactions, scheduled transactions, etc.
    // For now, it's the same as current balance
    this.virtualBalance = this.currentBalance;
  }

  // Account validation
  isValidIban(): boolean {
    if (!this.iban) return true;
    
    // Basic IBAN validation (simplified)
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/;
    return ibanRegex.test(this.iban.replace(/\s/g, ''));
  }

  isValidAccountNumber(): boolean {
    if (!this.accountNumber) return true;
    
    // Basic account number validation
    return this.accountNumber.length >= 4 && this.accountNumber.length <= 50;
  }

  // Account operations
  canBeDeleted(): boolean {
    // An account can be deleted if it has no transactions and is not a default account
    return this.role !== AccountRole.DEFAULT_ASSET;
  }

  shouldIncludeInNetWorth(): boolean {
    return this.includeNetWorth && (this.isAsset || this.isLiability);
  }
}