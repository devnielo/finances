import {
  Entity,
  Column,
  Index,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '../../common/entities/base.entity';
import { Account } from '../../accounts/entities/account.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User extends BaseEntity {
  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @Column({ type: 'timestamp with time zone', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLoginAt?: Date;

  @Column({ length: 10, nullable: true })
  timezone?: string;

  @Column({ length: 10, default: 'en' })
  locale: string;

  @Column({ length: 10, default: 'USD' })
  defaultCurrency: string;

  @Column({ type: 'text', nullable: true })
  avatar?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'json', nullable: true })
  preferences?: {
    dateFormat?: string;
    numberFormat?: string;
    theme?: 'light' | 'dark' | 'auto';
    dashboardLayout?: any;
    notifications?: {
      email?: boolean;
      push?: boolean;
      budgetAlerts?: boolean;
      billReminders?: boolean;
    };
  };

  // Two-Factor Authentication
  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ length: 255, nullable: true, select: false })
  twoFactorSecret?: string;

  @Column({ type: 'json', nullable: true, select: false })
  twoFactorRecoveryCodes?: string[];

  // OAuth fields
  @Column({ length: 255, nullable: true })
  googleId?: string;

  @Column({ length: 255, nullable: true })
  githubId?: string;

  @Column({ length: 255, nullable: true })
  microsoftId?: string;

  // Security tracking
  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lockedUntil?: Date;

  @Column({ type: 'json', nullable: true })
  loginHistory?: {
    ip: string;
    userAgent: string;
    location?: string;
    timestamp: Date;
  }[];

  // Relations
  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  // Virtual fields
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get isEmailVerified(): boolean {
    return !!this.emailVerifiedAt;
  }

  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  get isLocked(): boolean {
    return this.lockedUntil && this.lockedUntil > new Date();
  }

  // Password handling
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Security methods
  incrementFailedLoginAttempts(): void {
    this.failedLoginAttempts += 1;
    
    // Lock account after 5 failed attempts for 15 minutes
    if (this.failedLoginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
  }

  resetFailedLoginAttempts(): void {
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
  }

  updateLastLogin(ip: string, userAgent: string): void {
    this.lastLoginAt = new Date();
    
    // Add to login history (keep last 10 entries)
    const loginEntry = {
      ip,
      userAgent,
      timestamp: new Date(),
    };

    if (!this.loginHistory) {
      this.loginHistory = [];
    }

    this.loginHistory.unshift(loginEntry);
    this.loginHistory = this.loginHistory.slice(0, 10);
  }

  // Two-factor authentication methods
  enableTwoFactor(secret: string, recoveryCodes: string[]): void {
    this.twoFactorEnabled = true;
    this.twoFactorSecret = secret;
    this.twoFactorRecoveryCodes = recoveryCodes;
  }

  disableTwoFactor(): void {
    this.twoFactorEnabled = false;
    this.twoFactorSecret = null;
    this.twoFactorRecoveryCodes = null;
  }

  useRecoveryCode(code: string): boolean {
    if (!this.twoFactorRecoveryCodes?.includes(code)) {
      return false;
    }

    this.twoFactorRecoveryCodes = this.twoFactorRecoveryCodes.filter(
      (c) => c !== code,
    );
    return true;
  }
}