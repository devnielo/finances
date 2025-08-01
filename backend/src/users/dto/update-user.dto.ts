import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum, IsBoolean, IsObject } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { UserStatus } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsObject()
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

  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;
}