import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionJournal } from '../transactions/entities/transaction-journal.entity';
import { Account } from '../accounts/entities/account.entity';
import { Category } from '../categories/entities/category.entity';
import { DashboardQueryDto, DateRange } from './dto/dashboard-query.dto';

export interface DashboardOverview {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netWorth: number;
  accountsCount: number;
  transactionsCount: number;
  categoriesCount: number;
  lastTransactionDate?: Date;
}

export interface AccountSummary {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  lastTransactionDate?: Date;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  income: number;
  expenses: number;
  net: number;
}

export interface TransactionsByType {
  withdrawal: number;
  deposit: number;
  transfer: number;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionJournal)
    private readonly journalRepository: Repository<TransactionJournal>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getOverview(user: User, query: DashboardQueryDto): Promise<DashboardOverview> {
    const { startDate, endDate } = this.getDateRange(query);

    // Obtener todos los accounts del usuario
    const accounts = await this.accountRepository.find({
      where: { userId: user.id },
    });

    // Calcular balance total
    const totalBalance = accounts.reduce((sum, account) => sum + Number(account.currentBalance), 0);

    // Obtener transacciones en el rango de fechas
    const transactionsQuery = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.journal', 'journal')
      .leftJoin('transaction.account', 'account')
      .where('account.userId = :userId', { userId: user.id });

    if (startDate) {
      transactionsQuery.andWhere('transaction.date >= :startDate', { startDate });
    }
    if (endDate) {
      transactionsQuery.andWhere('transaction.date <= :endDate', { endDate });
    }

    const transactions = await transactionsQuery.getMany();

    // Calcular ingresos y gastos
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const transaction of transactions) {
      const amount = Number(transaction.amount);
      if (amount > 0) {
        totalIncome += amount;
      } else {
        totalExpenses += Math.abs(amount);
      }
    }

    // Contar categorías del usuario
    const categoriesCount = await this.categoryRepository.count({
      where: { userId: user.id },
    });

    // Obtener fecha de la última transacción
    const lastTransaction = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.account', 'account')
      .where('account.userId = :userId', { userId: user.id })
      .orderBy('transaction.date', 'DESC')
      .getOne();

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      netWorth: totalBalance,
      accountsCount: accounts.length,
      transactionsCount: transactions.length,
      categoriesCount,
      lastTransactionDate: lastTransaction?.date,
    };
  }

  async getAccountsSummary(user: User): Promise<AccountSummary[]> {
    const accounts = await this.accountRepository
      .createQueryBuilder('account')
      .leftJoin(
        'transaction', 'lastTransaction',
        'lastTransaction.accountId = account.id'
      )
      .select([
        'account.id',
        'account.name',
        'account.type',
        'account.currentBalance',
        'account.currencyCode',
        'MAX(lastTransaction.date) as lastTransactionDate'
      ])
      .where('account.userId = :userId', { userId: user.id })
      .groupBy('account.id')
      .getRawMany();

    return accounts.map(account => ({
      id: account.account_id,
      name: account.account_name,
      type: account.account_type,
      balance: Number(account.account_currentBalance),
      currency: account.account_currencyCode,
      lastTransactionDate: account.lastTransactionDate,
    }));
  }

  async getCategorySpending(user: User, query: DashboardQueryDto): Promise<CategorySpending[]> {
    const { startDate, endDate } = this.getDateRange(query);

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.account', 'account')
      .leftJoin('transaction.category', 'category')
      .select([
        'category.id as categoryId',
        'category.name as categoryName',
        'SUM(ABS(transaction.amount)) as totalAmount',
        'COUNT(transaction.id) as transactionCount'
      ])
      .where('account.userId = :userId', { userId: user.id })
      .andWhere('transaction.amount < 0') // Solo gastos
      .andWhere('category.id IS NOT NULL')
      .groupBy('category.id, category.name')
      .orderBy('totalAmount', 'DESC');

    if (startDate) {
      queryBuilder.andWhere('transaction.date >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('transaction.date <= :endDate', { endDate });
    }

    const results = await queryBuilder.getRawMany();
    const totalExpenses = results.reduce((sum, item) => sum + Number(item.totalAmount), 0);

    return results.map(item => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      totalAmount: Number(item.totalAmount),
      transactionCount: Number(item.transactionCount),
      percentage: totalExpenses > 0 ? (Number(item.totalAmount) / totalExpenses) * 100 : 0,
    }));
  }

  async getMonthlyTrends(user: User, months: number = 12): Promise<MonthlyTrend[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);

    const results = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.account', 'account')
      .select([
        'EXTRACT(YEAR FROM transaction.date) as year',
        'EXTRACT(MONTH FROM transaction.date) as month',
        'SUM(CASE WHEN transaction.amount > 0 THEN transaction.amount ELSE 0 END) as income',
        'SUM(CASE WHEN transaction.amount < 0 THEN ABS(transaction.amount) ELSE 0 END) as expenses'
      ])
      .where('account.userId = :userId', { userId: user.id })
      .andWhere('transaction.date >= :startDate', { startDate })
      .andWhere('transaction.date <= :endDate', { endDate })
      .groupBy('EXTRACT(YEAR FROM transaction.date), EXTRACT(MONTH FROM transaction.date)')
      .orderBy('year, month')
      .getRawMany();

    return results.map(item => ({
      month: String(item.month).padStart(2, '0'),
      year: Number(item.year),
      income: Number(item.income),
      expenses: Number(item.expenses),
      net: Number(item.income) - Number(item.expenses),
    }));
  }

  async getTransactionsByType(user: User, query: DashboardQueryDto): Promise<TransactionsByType> {
    const { startDate, endDate } = this.getDateRange(query);

    const queryBuilder = this.journalRepository
      .createQueryBuilder('journal')
      .leftJoin('journal.transactions', 'transaction')
      .leftJoin('transaction.account', 'account')
      .select([
        'journal.type as type',
        'COUNT(journal.id) as count'
      ])
      .where('account.userId = :userId', { userId: user.id })
      .groupBy('journal.type');

    if (startDate) {
      queryBuilder.andWhere('journal.date >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('journal.date <= :endDate', { endDate });
    }

    const results = await queryBuilder.getRawMany();

    const typeMap = results.reduce((acc, item) => {
      acc[item.type] = Number(item.count);
      return acc;
    }, {});

    return {
      withdrawal: typeMap.withdrawal || 0,
      deposit: typeMap.deposit || 0,
      transfer: typeMap.transfer || 0,
    };
  }

  async getRecentTransactions(user: User, limit: number = 10) {
    return await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.account', 'account')
      .leftJoin('transaction.category', 'category')
      .leftJoin('transaction.journal', 'journal')
      .select([
        'transaction.id',
        'transaction.amount',
        'transaction.description',
        'transaction.date',
        'account.name as accountName',
        'category.name as categoryName',
        'journal.type as type'
      ])
      .where('account.userId = :userId', { userId: user.id })
      .orderBy('transaction.date', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  private getDateRange(query: DashboardQueryDto): { startDate?: Date; endDate?: Date } {
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (query.dateRange === DateRange.CUSTOM) {
      return { startDate: query.startDate, endDate: query.endDate };
    }

    switch (query.dateRange) {
      case DateRange.LAST_7_DAYS:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;

      case DateRange.LAST_30_DAYS:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;

      case DateRange.LAST_90_DAYS:
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;

      case DateRange.CURRENT_MONTH:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;

      case DateRange.LAST_MONTH:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;

      case DateRange.CURRENT_YEAR:
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;

      case DateRange.LAST_YEAR:
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
    }

    return { startDate, endDate };
  }
}