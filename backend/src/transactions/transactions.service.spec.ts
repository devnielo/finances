import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { TransactionJournal } from './entities/transaction-journal.entity';
import { AccountsService } from '../accounts/accounts.service';
import { CreateTransactionDto, TransactionType } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { Account, AccountType } from '../accounts/entities/account.entity';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionRepository: Repository<Transaction>;
  let journalRepository: Repository<TransactionJournal>;
  let accountsService: AccountsService;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  const mockTransaction = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sourceAccountId: '123e4567-e89b-12d3-a456-426614174001',
    destinationAccountId: '123e4567-e89b-12d3-a456-426614174002',
    amount: 100.50,
    description: 'Test transaction',
    currencyCode: 'USD',
    journalId: '123e4567-e89b-12d3-a456-426614174003',
    identifier: 1,
  };

  const mockJournal = {
    id: '123e4567-e89b-12d3-a456-426614174003',
    userId: '123e4567-e89b-12d3-a456-426614174004',
    type: 'withdrawal',
    description: 'Test transaction',
    date: new Date('2023-01-01'),
    transactions: [mockTransaction],
  };

  const mockAssetAccount = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Checking Account',
    type: AccountType.ASSET,
    userId: '123e4567-e89b-12d3-a456-426614174004',
    currentBalance: 1000,
  };

  const mockExpenseAccount = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    name: 'Groceries',
    type: AccountType.EXPENSE,
    userId: '123e4567-e89b-12d3-a456-426614174004',
    currentBalance: 0,
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      increment: jest.fn(),
      decrement: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TransactionJournal),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: AccountsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
    journalRepository = module.get<Repository<TransactionJournal>>(
      getRepositoryToken(TransactionJournal),
    );
    accountsService = module.get<AccountsService>(AccountsService);
    dataSource = module.get<DataSource>(DataSource);
    queryRunner = dataSource.createQueryRunner();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174004';
    const createTransactionDto: CreateTransactionDto = {
      type: TransactionType.WITHDRAWAL,
      description: 'Test transaction',
      date: '2023-01-01',
      splits: [
        {
          sourceAccountId: '123e4567-e89b-12d3-a456-426614174001',
          destinationAccountId: '123e4567-e89b-12d3-a456-426614174002',
          amount: 100.50,
        },
      ],
    };

    it('should create a transaction successfully', async () => {
      // Arrange
      jest.spyOn(accountsService, 'findOne')
        .mockResolvedValueOnce(mockAssetAccount as any)
        .mockResolvedValueOnce(mockExpenseAccount as any);

      mockQueryRunner.manager.create
        .mockReturnValueOnce(mockJournal)
        .mockReturnValueOnce(mockTransaction);

      mockQueryRunner.manager.save
        .mockResolvedValueOnce({ ...mockJournal, id: mockJournal.id })
        .mockResolvedValueOnce([mockTransaction]);

      jest.spyOn(service, 'findOne').mockResolvedValue(mockJournal as any);

      // Act
      const result = await service.create(userId, createTransactionDto);

      // Assert
      expect(result).toEqual(mockJournal);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(accountsService.findOne).toHaveBeenCalledTimes(2);
    });

    it('should rollback transaction on error', async () => {
      // Arrange
      jest.spyOn(accountsService, 'findOne')
        .mockResolvedValueOnce(mockAssetAccount as any)
        .mockResolvedValueOnce(mockExpenseAccount as any);

      mockQueryRunner.manager.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Act & Assert
      await expect(service.create(userId, createTransactionDto)).rejects.toThrow('Database error');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should validate withdrawal transaction rules', async () => {
      // Arrange
      const invalidDto = {
        ...createTransactionDto,
        splits: [
          {
            sourceAccountId: '123e4567-e89b-12d3-a456-426614174002', // Expense account as source
            destinationAccountId: '123e4567-e89b-12d3-a456-426614174001',
            amount: 100.50,
          },
        ],
      };

      jest.spyOn(accountsService, 'findOne')
        .mockResolvedValueOnce(mockExpenseAccount as any)
        .mockResolvedValueOnce(mockAssetAccount as any);

      // Act & Assert
      await expect(service.create(userId, invalidDto)).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174004';

    it('should return paginated transactions', async () => {
      // Arrange
      const query: TransactionQueryDto = {
        page: 1,
        limit: 10,
      };

      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([mockJournal]),
      };

      jest.spyOn(journalRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.findAll(userId, query);

      // Assert
      expect(result).toEqual({
        transactions: [mockJournal],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should apply filters correctly', async () => {
      // Arrange
      const query: TransactionQueryDto = {
        page: 1,
        limit: 10,
        type: TransactionType.WITHDRAWAL,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        search: 'groceries',
      };

      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(journalRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.findAll(userId, query);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('journal.type = :type', { type: query.type });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('journal.date >= :startDate', { startDate: query.startDate });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('journal.date <= :endDate', { endDate: query.endDate });
    });
  });

  describe('findOne', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174004';
    const transactionId = '123e4567-e89b-12d3-a456-426614174003';

    it('should return a transaction by id', async () => {
      // Arrange
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockJournal),
      };

      jest.spyOn(journalRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.findOne(userId, transactionId);

      // Assert
      expect(result).toEqual(mockJournal);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'journal.id = :id AND journal.userId = :userId',
        { id: transactionId, userId }
      );
    });

    it('should throw NotFoundException when transaction not found', async () => {
      // Arrange
      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      jest.spyOn(journalRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      // Act & Assert
      await expect(service.findOne(userId, transactionId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTransactionSummary', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174004';

    it('should return transaction summary', async () => {
      // Arrange
      const mockJournals = [
        {
          ...mockJournal,
          type: 'deposit',
          transactions: [{ ...mockTransaction, amount: 500 }],
        },
        {
          ...mockJournal,
          type: 'withdrawal',
          transactions: [{ ...mockTransaction, amount: 200 }],
        },
      ];

      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockJournals),
      };

      jest.spyOn(journalRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getTransactionSummary(userId);

      // Assert
      expect(result).toEqual({
        totalTransactions: 2,
        totalIncome: 500,
        totalExpenses: 200,
        netFlow: 300,
        averageTransaction: 350,
      });
    });
  });
});