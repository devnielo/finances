import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { User } from '../src/users/entities/user.entity';
import { Account, AccountType } from '../src/accounts/entities/account.entity';
import { TransactionJournal, TransactionJournalType } from '../src/transactions/entities/transaction-journal.entity';
import { Transaction } from '../src/transactions/entities/transaction.entity';
import { JwtService } from '@nestjs/jwt';

describe('TransactionsController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let accountRepository: Repository<Account>;
  let journalRepository: Repository<TransactionJournal>;
  let transactionRepository: Repository<Transaction>;
  let jwtService: JwtService;

  let testUser: User;
  let assetAccount: Account;
  let expenseAccount: Account;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same global pipes as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.setGlobalPrefix('api/v1');

    await app.init();

    // Get repositories
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    accountRepository = moduleFixture.get<Repository<Account>>(getRepositoryToken(Account));
    journalRepository = moduleFixture.get<Repository<TransactionJournal>>(getRepositoryToken(TransactionJournal));
    transactionRepository = moduleFixture.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  beforeEach(async () => {
    // Clean up database
    await transactionRepository.delete({});
    await journalRepository.delete({});
    await accountRepository.delete({});
    await userRepository.delete({});

    // Create test user
    testUser = userRepository.create({
      email: 'test@example.com',
      password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewkCJ0F.8/VSG6fi', // 'password123'
      firstName: 'Test',
      lastName: 'User',
      isEmailVerified: true,
      isActive: true,
    });
    testUser = await userRepository.save(testUser);

    // Create test accounts
    assetAccount = accountRepository.create({
      name: 'Test Checking Account',
      type: AccountType.ASSET,
      userId: testUser.id,
      currentBalance: 1000,
      virtualBalance: 1000,
      currencyCode: 'USD',
      active: true,
      order: 1,
    });
    assetAccount = await accountRepository.save(assetAccount);

    expenseAccount = accountRepository.create({
      name: 'Test Groceries',
      type: AccountType.EXPENSE,
      userId: testUser.id,
      currentBalance: 0,
      virtualBalance: 0,
      currencyCode: 'USD',
      active: true,
      order: 2,
    });
    expenseAccount = await accountRepository.save(expenseAccount);

    // Generate auth token
    authToken = jwtService.sign({
      sub: testUser.id,
      email: testUser.email,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/transactions (POST)', () => {
    it('should create a withdrawal transaction', async () => {
      const createTransactionDto = {
        type: 'withdrawal',
        description: 'Grocery shopping',
        date: '2023-01-01',
        splits: [
          {
            sourceAccountId: assetAccount.id,
            destinationAccountId: expenseAccount.id,
            amount: 50.25,
            description: 'Weekly groceries',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTransactionDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.description).toBe('Grocery shopping');
      expect(response.body.type).toBe('withdrawal');
      expect(response.body.transactions).toHaveLength(1);
      expect(response.body.transactions[0].amount).toBe('50.25');

      // Verify account balances were updated
      const updatedAssetAccount = await accountRepository.findOne({
        where: { id: assetAccount.id },
      });
      const updatedExpenseAccount = await accountRepository.findOne({
        where: { id: expenseAccount.id },
      });

      expect(Number(updatedAssetAccount.currentBalance)).toBe(949.75);
      expect(Number(updatedExpenseAccount.currentBalance)).toBe(50.25);
    });

    it('should create a split transaction', async () => {
      // Create another expense account
      const expenseAccount2 = accountRepository.create({
        name: 'Test Entertainment',
        type: AccountType.EXPENSE,
        userId: testUser.id,
        currentBalance: 0,
        virtualBalance: 0,
        currencyCode: 'USD',
        active: true,
        order: 3,
      });
      await accountRepository.save(expenseAccount2);

      const createTransactionDto = {
        type: 'withdrawal',
        description: 'Mixed expenses',
        date: '2023-01-01',
        splits: [
          {
            sourceAccountId: assetAccount.id,
            destinationAccountId: expenseAccount.id,
            amount: 30,
            description: 'Groceries',
          },
          {
            sourceAccountId: assetAccount.id,
            destinationAccountId: expenseAccount2.id,
            amount: 20,
            description: 'Movie tickets',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTransactionDto)
        .expect(201);

      expect(response.body.transactions).toHaveLength(2);
      expect(response.body.transactions[0].amount).toBe('30');
      expect(response.body.transactions[1].amount).toBe('20');

      // Verify balances
      const updatedAssetAccount = await accountRepository.findOne({
        where: { id: assetAccount.id },
      });
      expect(Number(updatedAssetAccount.currentBalance)).toBe(950); // 1000 - 30 - 20
    });

    it('should reject invalid transaction type combinations', async () => {
      const invalidDto = {
        type: 'withdrawal',
        description: 'Invalid transaction',
        date: '2023-01-01',
        splits: [
          {
            sourceAccountId: expenseAccount.id, // Wrong: expense as source for withdrawal
            destinationAccountId: assetAccount.id,
            amount: 50,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should require authentication', async () => {
      const createTransactionDto = {
        type: 'withdrawal',
        description: 'Test transaction',
        date: '2023-01-01',
        splits: [
          {
            sourceAccountId: assetAccount.id,
            destinationAccountId: expenseAccount.id,
            amount: 50,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/v1/transactions')
        .send(createTransactionDto)
        .expect(401);
    });
  });

  describe('/api/v1/transactions (GET)', () => {
    let testTransaction: TransactionJournal;

    beforeEach(async () => {
      // Create a test transaction
      const journal = journalRepository.create({
        userId: testUser.id,
        type: TransactionJournalType.WITHDRAWAL,
        description: 'Test transaction',
        date: new Date('2023-01-01'),
      });
      testTransaction = await journalRepository.save(journal);

      const transaction = transactionRepository.create({
        journalId: testTransaction.id,
        sourceAccountId: assetAccount.id,
        destinationAccountId: expenseAccount.id,
        amount: 100,
        description: 'Test transaction',
        currencyCode: 'USD',
        identifier: 1,
      });
      await transactionRepository.save(transaction);
    });

    it('should return paginated transactions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body.transactions).toHaveLength(1);
    });

    it('should filter transactions by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'withdrawal' })
        .expect(200);

      expect(response.body.transactions).toHaveLength(1);
      expect(response.body.transactions[0].type).toBe('withdrawal');
    });

    it('should filter transactions by date range', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: '2022-12-31',
          endDate: '2023-01-02',
        })
        .expect(200);

      expect(response.body.transactions).toHaveLength(1);
    });

    it('should search transactions by description', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'test' })
        .expect(200);

      expect(response.body.transactions).toHaveLength(1);
    });
  });

  describe('/api/v1/transactions/summary (GET)', () => {
    beforeEach(async () => {
      // Create test transactions for summary
      const depositJournal = journalRepository.create({
        userId: testUser.id,
        type: TransactionJournalType.DEPOSIT,
        description: 'Salary',
        date: new Date('2023-01-01'),
      });
      const savedDepositJournal = await journalRepository.save(depositJournal);

      const depositTransaction = transactionRepository.create({
        journalId: savedDepositJournal.id,
        sourceAccountId: expenseAccount.id, // Revenue account would be better, but using expense for simplicity
        destinationAccountId: assetAccount.id,
        amount: 2000,
        description: 'Salary',
        currencyCode: 'USD',
        identifier: 1,
      });
      await transactionRepository.save(depositTransaction);

      const withdrawalJournal = journalRepository.create({
        userId: testUser.id,
        type: TransactionJournalType.WITHDRAWAL,
        description: 'Groceries',
        date: new Date('2023-01-02'),
      });
      const savedWithdrawalJournal = await journalRepository.save(withdrawalJournal);

      const withdrawalTransaction = transactionRepository.create({
        journalId: savedWithdrawalJournal.id,
        sourceAccountId: assetAccount.id,
        destinationAccountId: expenseAccount.id,
        amount: 150,
        description: 'Groceries',
        currencyCode: 'USD',
        identifier: 1,
      });
      await transactionRepository.save(withdrawalTransaction);
    });

    it('should return transaction summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/transactions/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalTransactions');
      expect(response.body).toHaveProperty('totalIncome');
      expect(response.body).toHaveProperty('totalExpenses');
      expect(response.body).toHaveProperty('netFlow');
      expect(response.body).toHaveProperty('averageTransaction');

      expect(response.body.totalTransactions).toBe(2);
      expect(response.body.totalIncome).toBe(2000);
      expect(response.body.totalExpenses).toBe(150);
      expect(response.body.netFlow).toBe(1850);
    });
  });

  describe('/api/v1/transactions/:id (GET)', () => {
    let testTransaction: TransactionJournal;

    beforeEach(async () => {
      const journal = journalRepository.create({
        userId: testUser.id,
        type: TransactionJournalType.WITHDRAWAL,
        description: 'Test transaction',
        date: new Date('2023-01-01'),
      });
      testTransaction = await journalRepository.save(journal);

      const transaction = transactionRepository.create({
        journalId: testTransaction.id,
        sourceAccountId: assetAccount.id,
        destinationAccountId: expenseAccount.id,
        amount: 100,
        description: 'Test transaction',
        currencyCode: 'USD',
        identifier: 1,
      });
      await transactionRepository.save(transaction);
    });

    it('should return transaction details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/transactions/${testTransaction.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(testTransaction.id);
      expect(response.body.description).toBe('Test transaction');
      expect(response.body.transactions).toHaveLength(1);
    });

    it('should return 404 for non-existent transaction', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174999';
      
      await request(app.getHttpServer())
        .get(`/api/v1/transactions/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not return transactions from other users', async () => {
      // Create another user and their transaction
      const otherUser = userRepository.create({
        email: 'other@example.com',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewkCJ0F.8/VSG6fi',
        firstName: 'Other',
        lastName: 'User',
        isEmailVerified: true,
        isActive: true,
      });
      const savedOtherUser = await userRepository.save(otherUser);

      const otherJournal = journalRepository.create({
        userId: savedOtherUser.id,
        type: TransactionJournalType.WITHDRAWAL,
        description: 'Other user transaction',
        date: new Date('2023-01-01'),
      });
      const savedOtherJournal = await journalRepository.save(otherJournal);

      await request(app.getHttpServer())
        .get(`/api/v1/transactions/${savedOtherJournal.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/api/v1/transactions/:id (DELETE)', () => {
    let testTransaction: TransactionJournal;

    beforeEach(async () => {
      const journal = journalRepository.create({
        userId: testUser.id,
        type: TransactionJournalType.WITHDRAWAL,
        description: 'Test transaction',
        date: new Date('2023-01-01'),
      });
      testTransaction = await journalRepository.save(journal);

      const transaction = transactionRepository.create({
        journalId: testTransaction.id,
        sourceAccountId: assetAccount.id,
        destinationAccountId: expenseAccount.id,
        amount: 100,
        description: 'Test transaction',
        currencyCode: 'USD',
        identifier: 1,
      });
      await transactionRepository.save(transaction);

      // Update account balances to simulate the transaction effect
      await accountRepository.update(assetAccount.id, { currentBalance: 900 });
      await accountRepository.update(expenseAccount.id, { currentBalance: 100 });
    });

    it('should delete transaction and revert balances', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/transactions/${testTransaction.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify transaction is deleted
      const deletedTransaction = await journalRepository.findOne({
        where: { id: testTransaction.id },
      });
      expect(deletedTransaction).toBeNull();

      // Verify balances are reverted
      const revertedAssetAccount = await accountRepository.findOne({
        where: { id: assetAccount.id },
      });
      const revertedExpenseAccount = await accountRepository.findOne({
        where: { id: expenseAccount.id },
      });

      expect(Number(revertedAssetAccount.currentBalance)).toBe(1000);
      expect(Number(revertedExpenseAccount.currentBalance)).toBe(0);
    });
  });
});