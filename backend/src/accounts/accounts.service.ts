import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Account, AccountType } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

export interface AccountBalance {
  accountId: string;
  currentBalance: number;
  availableBalance: number;
  lastCalculated: Date;
}

export interface AccountSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  totalAccounts: number;
  activeAccounts: number;
}

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async create(userId: string, createAccountDto: CreateAccountDto): Promise<Account> {
    // Verificar que no exista una cuenta con el mismo nombre para el usuario
    const existingAccount = await this.accountRepository.findOne({
      where: {
        userId,
        name: createAccountDto.name,
      },
    });

    if (existingAccount) {
      throw new ConflictException('Ya existe una cuenta con este nombre');
    }

    // Verificar IBAN único si se proporciona
    if (createAccountDto.iban) {
      const existingIban = await this.accountRepository.findOne({
        where: {
          userId,
          iban: createAccountDto.iban,
        },
      });

      if (existingIban) {
        throw new ConflictException('Ya existe una cuenta con este IBAN');
      }
    }

    // Obtener el siguiente orden si no se especifica
    if (!createAccountDto.order) {
      const maxOrder = await this.accountRepository
        .createQueryBuilder('account')
        .select('MAX(account.order)', 'maxOrder')
        .where('account.userId = :userId', { userId })
        .getRawOne();
      
      createAccountDto.order = (maxOrder?.maxOrder || 0) + 1;
    }

    // Crear la cuenta
    const account = this.accountRepository.create({
      ...createAccountDto,
      userId,
      currentBalance: createAccountDto.initialBalance || 0,
      virtualBalance: createAccountDto.initialBalance || 0,
      currencyCode: createAccountDto.currencyCode || 'USD',
    });

    return this.accountRepository.save(account);
  }

  async findAll(userId: string, accountType?: AccountType): Promise<Account[]> {
    const where: FindOptionsWhere<Account> = { userId };
    
    if (accountType) {
      where.type = accountType;
    }

    return this.accountRepository.find({
      where,
      order: {
        order: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findOne(userId: string, id: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException('Cuenta no encontrada');
    }

    return account;
  }

  async update(userId: string, id: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    const account = await this.findOne(userId, id);

    // Verificar nombre único si se está cambiando
    if (updateAccountDto.name && updateAccountDto.name !== account.name) {
      const existingAccount = await this.accountRepository.findOne({
        where: {
          userId,
          name: updateAccountDto.name,
        },
      });

      if (existingAccount && existingAccount.id !== id) {
        throw new ConflictException('Ya existe una cuenta con este nombre');
      }
    }

    // Verificar IBAN único si se está cambiando
    if (updateAccountDto.iban && updateAccountDto.iban !== account.iban) {
      const existingIban = await this.accountRepository.findOne({
        where: {
          userId,
          iban: updateAccountDto.iban,
        },
      });

      if (existingIban && existingIban.id !== id) {
        throw new ConflictException('Ya existe una cuenta con este IBAN');
      }
    }

    // Actualizar la cuenta
    Object.assign(account, updateAccountDto);
    return this.accountRepository.save(account);
  }

  async remove(userId: string, id: string): Promise<void> {
    const account = await this.findOne(userId, id);

    // Verificar que no tenga transacciones (esto se implementará cuando tengamos transacciones)
    // Por ahora solo verificamos que no sea una cuenta del sistema
    if (account.type === AccountType.INITIAL_BALANCE) {
      throw new ForbiddenException('No se puede eliminar una cuenta de balance inicial');
    }

    await this.accountRepository.softDelete(id);
  }

  async getBalance(userId: string, accountId: string): Promise<AccountBalance> {
    const account = await this.findOne(userId, accountId);

    // Por ahora devolvemos el balance virtual
    // Cuando implementemos transacciones, calcularemos el balance real
    return {
      accountId: account.id,
      currentBalance: account.virtualBalance,
      availableBalance: account.virtualBalance,
      lastCalculated: new Date(),
    };
  }

  async getAccountSummary(userId: string): Promise<AccountSummary> {
    const accounts = await this.findAll(userId);
    
    let totalAssets = 0;
    let totalLiabilities = 0;
    let activeAccounts = 0;

    for (const account of accounts) {
      if (account.active) {
        activeAccounts++;
      }

      if (account.includeNetWorth && account.active) {
        if (account.type === AccountType.ASSET) {
          totalAssets += account.virtualBalance;
        } else if (account.type === AccountType.LIABILITY) {
          totalLiabilities += Math.abs(account.virtualBalance);
        }
      }
    }

    return {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      totalAccounts: accounts.length,
      activeAccounts,
    };
  }

  async findByType(userId: string, accountType: AccountType): Promise<Account[]> {
    return this.findAll(userId, accountType);
  }

  async toggleActive(userId: string, id: string): Promise<Account> {
    const account = await this.findOne(userId, id);
    account.active = !account.active;
    return this.accountRepository.save(account);
  }

  async reorderAccounts(userId: string, accountOrders: { id: string; order: number }[]): Promise<void> {
    for (const { id, order } of accountOrders) {
      await this.accountRepository.update(
        { id, userId },
        { order }
      );
    }
  }

  async getAccountsByIds(userId: string, ids: string[]): Promise<Account[]> {
    return this.accountRepository.find({
      where: {
        userId,
        id: ids[0], // Simplified for now, will be improved with proper IN syntax
      },
    });
  }

  async updateBalance(accountId: string, newBalance: number): Promise<void> {
    await this.accountRepository.update(accountId, {
      virtualBalance: newBalance,
    });
  }
}