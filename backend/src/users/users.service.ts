import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByEmailOrUsername(
      createUserDto.email,
      createUserDto.username,
    );

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: [
        'id',
        'firstName',
        'lastName',
        'username',
        'email',
        'role',
        'status',
        'emailVerifiedAt',
        'lastLoginAt',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'firstName',
        'lastName',
        'username',
        'email',
        'role',
        'status',
        'emailVerifiedAt',
        'lastLoginAt',
        'timezone',
        'locale',
        'defaultCurrency',
        'avatar',
        'bio',
        'preferences',
        'twoFactorEnabled',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'firstName',
        'lastName',
        'username',
        'email',
        'password',
        'role',
        'status',
        'emailVerifiedAt',
        'twoFactorEnabled',
        'twoFactorSecret',
        'failedLoginAttempts',
        'lockedUntil',
      ],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      select: [
        'id',
        'firstName',
        'lastName',
        'username',
        'email',
        'password',
        'role',
        'status',
        'emailVerifiedAt',
        'twoFactorEnabled',
        'twoFactorSecret',
        'failedLoginAttempts',
        'lockedUntil',
      ],
    });
  }

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ email }, { username }],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check for email/username conflicts if they are being updated
    if (updateUserDto.email || updateUserDto.username) {
      const existingUser = await this.findByEmailOrUsername(
        updateUserDto.email || user.email,
        updateUserDto.username || user.username,
      );

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('User with this email or username already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.softDelete(id);
  }

  async verifyEmail(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.emailVerifiedAt = new Date();
    user.status = UserStatus.ACTIVE;
    return this.userRepository.save(user);
  }

  async updateLastLogin(id: string, ip: string, userAgent: string): Promise<void> {
    const user = await this.findOne(id);
    user.updateLastLogin(ip, userAgent);
    await this.userRepository.save(user);
  }

  async incrementFailedLoginAttempts(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.incrementFailedLoginAttempts();
    await this.userRepository.save(user);
  }

  async resetFailedLoginAttempts(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.resetFailedLoginAttempts();
    await this.userRepository.save(user);
  }

  async updatePreferences(id: string, preferences: any): Promise<User> {
    const user = await this.findOne(id);
    user.preferences = { ...user.preferences, ...preferences };
    return this.userRepository.save(user);
  }

  async enableTwoFactor(id: string, secret: string, recoveryCodes: string[]): Promise<void> {
    const user = await this.findOne(id);
    user.enableTwoFactor(secret, recoveryCodes);
    await this.userRepository.save(user);
  }

  async disableTwoFactor(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.disableTwoFactor();
    await this.userRepository.save(user);
  }

  async useRecoveryCode(id: string, code: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'twoFactorRecoveryCodes'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const codeUsed = user.useRecoveryCode(code);
    if (codeUsed) {
      await this.userRepository.save(user);
    }

    return codeUsed;
  }

  async getUserStats(id: string): Promise<any> {
    const user = await this.findOne(id);
    
    // This would be expanded to include actual statistics
    return {
      accountsCount: 0, // Would query accounts
      transactionsCount: 0, // Would query transactions
      categoriesCount: 0, // Would query categories
      lastLoginAt: user.lastLoginAt,
      memberSince: user.createdAt,
    };
  }
}