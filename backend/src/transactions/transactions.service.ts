import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionJournal, TransactionJournalType } from './entities/transaction-journal.entity';
import { CreateTransactionDto, TransactionType } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { AccountsService } from '../accounts/accounts.service';
import { Account, AccountType } from '../accounts/entities/account.entity';

export interface TransactionSummary {
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  averageTransaction: number;
}

export interface PaginatedTransactions {
  transactions: TransactionJournal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionJournal)
    private readonly journalRepository: Repository<TransactionJournal>,
    private readonly accountsService: AccountsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto): Promise<TransactionJournal> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar que todas las cuentas pertenezcan al usuario
      const accountIds = [
        ...createTransactionDto.splits.map(s => s.sourceAccountId),
        ...createTransactionDto.splits.map(s => s.destinationAccountId),
      ];
      const uniqueAccountIds = [...new Set(accountIds)];
      
      for (const accountId of uniqueAccountIds) {
        await this.accountsService.findOne(userId, accountId);
      }

      // Validar lógica de tipos de transacción
      await this.validateTransactionType(createTransactionDto, userId);

      // Crear el journal
      const journal = queryRunner.manager.create(TransactionJournal, {
        userId,
        type: createTransactionDto.type as unknown as TransactionJournalType,
        description: createTransactionDto.description,
        date: new Date(createTransactionDto.date),
        notes: createTransactionDto.notes,
        externalId: createTransactionDto.externalReference,
        internalReference: createTransactionDto.internalReference,
      });

      const savedJournal = await queryRunner.manager.save(journal);

      // Crear las transacciones (splits)
      const transactions: Transaction[] = [];
      for (let i = 0; i < createTransactionDto.splits.length; i++) {
        const split = createTransactionDto.splits[i];
        
        const transaction = queryRunner.manager.create(Transaction, {
          journalId: savedJournal.id,
          sourceAccountId: split.sourceAccountId,
          destinationAccountId: split.destinationAccountId,
          amount: split.amount,
          description: split.description || createTransactionDto.description,
          currencyCode: split.currencyCode || 'USD',
          foreignCurrencyCode: split.foreignCurrencyCode,
          foreignAmount: split.foreignAmount,
          identifier: i + 1,
        });

        transactions.push(transaction);
      }

      await queryRunner.manager.save(transactions);

      // Actualizar balances de las cuentas
      await this.updateAccountBalances(queryRunner, createTransactionDto);

      await queryRunner.commitTransaction();

      // Retornar el journal completo con relaciones
      return this.findOne(userId, savedJournal.id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId: string, query: TransactionQueryDto): Promise<PaginatedTransactions> {
    const queryBuilder = this.journalRepository
      .createQueryBuilder('journal')
      .leftJoinAndSelect('journal.transactions', 'transaction')
      .leftJoinAndSelect('transaction.sourceAccount', 'sourceAccount')
      .leftJoinAndSelect('transaction.destinationAccount', 'destinationAccount')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('journal.userId = :userId', { userId });

    // Aplicar filtros
    if (query.type) {
      queryBuilder.andWhere('journal.type = :type', { type: query.type });
    }

    if (query.startDate) {
      queryBuilder.andWhere('journal.date >= :startDate', { startDate: query.startDate });
    }

    if (query.endDate) {
      queryBuilder.andWhere('journal.date <= :endDate', { endDate: query.endDate });
    }

    if (query.accountId) {
      queryBuilder.andWhere(
        '(transaction.sourceAccountId = :accountId OR transaction.destinationAccountId = :accountId)',
        { accountId: query.accountId }
      );
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(journal.description ILIKE :search OR transaction.description ILIKE :search)',
        { search: `%${query.search}%` }
      );
    }

    // Ordenamiento
    const sortField = query.sortBy === 'amount' ? 'transaction.amount' : 
                     query.sortBy === 'description' ? 'journal.description' : 'journal.date';
    queryBuilder.orderBy(sortField, query.sortOrder?.toUpperCase() as 'ASC' | 'DESC');

    // Paginación
    const total = await queryBuilder.getCount();
    const transactions = await queryBuilder
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getMany();

    return {
      transactions,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async findOne(userId: string, id: string): Promise<TransactionJournal> {
    const journal = await this.journalRepository
      .createQueryBuilder('journal')
      .leftJoinAndSelect('journal.transactions', 'transaction')
      .leftJoinAndSelect('transaction.sourceAccount', 'sourceAccount')
      .leftJoinAndSelect('transaction.destinationAccount', 'destinationAccount')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('journal.id = :id AND journal.userId = :userId', { id, userId })
      .getOne();

    if (!journal) {
      throw new NotFoundException('Transacción no encontrada');
    }

    return journal;
  }

  async update(userId: string, id: string, updateTransactionDto: UpdateTransactionDto): Promise<TransactionJournal> {
    const journal = await this.findOne(userId, id);
    
    // Por simplicidad, vamos a permitir solo actualizar descripción y notas por ahora
    // En una implementación completa, habría que manejar la actualización de splits y balances
    if (updateTransactionDto.description) {
      journal.description = updateTransactionDto.description;
    }
    
    if (updateTransactionDto.notes) {
      journal.notes = updateTransactionDto.notes;
    }

    await this.journalRepository.save(journal);
    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string): Promise<void> {
    const journal = await this.findOne(userId, id);
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Revertir los cambios de balance antes de eliminar
      await this.revertAccountBalances(queryRunner, journal);
      
      // Eliminar transacciones y journal
      await queryRunner.manager.delete(Transaction, { journalId: id });
      await queryRunner.manager.delete(TransactionJournal, { id });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactionSummary(userId: string, startDate?: string, endDate?: string): Promise<TransactionSummary> {
    const queryBuilder = this.journalRepository
      .createQueryBuilder('journal')
      .leftJoin('journal.transactions', 'transaction')
      .where('journal.userId = :userId', { userId });

    if (startDate) {
      queryBuilder.andWhere('journal.date >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('journal.date <= :endDate', { endDate });
    }

    const transactions = await queryBuilder
      .leftJoinAndSelect('journal.transactions', 'trans')
      .getMany();

    let totalIncome = 0;
    let totalExpenses = 0;
    let totalTransactions = 0;

    for (const journal of transactions) {
      totalTransactions++;
      const amount = journal.transactions.reduce((sum, t) => sum + t.amount, 0);
      
      if (journal.type === TransactionJournalType.DEPOSIT) {
        totalIncome += amount;
      } else if (journal.type === TransactionJournalType.WITHDRAWAL) {
        totalExpenses += amount;
      }
    }

    const netFlow = totalIncome - totalExpenses;
    const averageTransaction = totalTransactions > 0 ? (totalIncome + totalExpenses) / totalTransactions : 0;

    return {
      totalTransactions,
      totalIncome,
      totalExpenses,
      netFlow,
      averageTransaction,
    };
  }

  private async validateTransactionType(dto: CreateTransactionDto, userId: string): Promise<void> {
    for (const split of dto.splits) {
      const sourceAccount = await this.accountsService.findOne(userId, split.sourceAccountId);
      const destinationAccount = await this.accountsService.findOne(userId, split.destinationAccountId);

      switch (dto.type) {
        case TransactionType.WITHDRAWAL:
          // De Asset a Expense
          if (sourceAccount.type !== AccountType.ASSET || destinationAccount.type !== AccountType.EXPENSE) {
            throw new BadRequestException(
              'Para gastos (withdrawal), la cuenta origen debe ser Asset y la destino Expense'
            );
          }
          break;

        case TransactionType.DEPOSIT:
          // De Revenue a Asset
          if (sourceAccount.type !== AccountType.REVENUE || destinationAccount.type !== AccountType.ASSET) {
            throw new BadRequestException(
              'Para ingresos (deposit), la cuenta origen debe ser Revenue y la destino Asset'
            );
          }
          break;

        case TransactionType.TRANSFER:
          // Entre Assets
          if (sourceAccount.type !== AccountType.ASSET || destinationAccount.type !== AccountType.ASSET) {
            throw new BadRequestException(
              'Para transferencias, ambas cuentas deben ser de tipo Asset'
            );
          }
          if (split.sourceAccountId === split.destinationAccountId) {
            throw new BadRequestException('No se puede transferir a la misma cuenta');
          }
          break;

        default:
          throw new BadRequestException('Tipo de transacción no válido');
      }
    }
  }

  private async updateAccountBalances(queryRunner: QueryRunner, dto: CreateTransactionDto): Promise<void> {
    for (const split of dto.splits) {
      // Restar del balance de la cuenta origen
      await queryRunner.manager.decrement(
        Account,
        { id: split.sourceAccountId },
        'currentBalance',
        split.amount
      );
      await queryRunner.manager.decrement(
        Account,
        { id: split.sourceAccountId },
        'virtualBalance',
        split.amount
      );

      // Sumar al balance de la cuenta destino
      await queryRunner.manager.increment(
        Account,
        { id: split.destinationAccountId },
        'currentBalance',
        split.amount
      );
      await queryRunner.manager.increment(
        Account,
        { id: split.destinationAccountId },
        'virtualBalance',
        split.amount
      );
    }
  }

  private async revertAccountBalances(queryRunner: QueryRunner, journal: TransactionJournal): Promise<void> {
    for (const transaction of journal.transactions) {
      // Revertir: sumar a la cuenta origen y restar de la destino
      await queryRunner.manager.increment(
        Account,
        { id: transaction.sourceAccountId },
        'currentBalance',
        transaction.amount
      );
      await queryRunner.manager.increment(
        Account,
        { id: transaction.sourceAccountId },
        'virtualBalance',
        transaction.amount
      );

      await queryRunner.manager.decrement(
        Account,
        { id: transaction.destinationAccountId },
        'currentBalance',
        transaction.amount
      );
      await queryRunner.manager.decrement(
        Account,
        { id: transaction.destinationAccountId },
        'virtualBalance',
        transaction.amount
      );
    }
  }
}