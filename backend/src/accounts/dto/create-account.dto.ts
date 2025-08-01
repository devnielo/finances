import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '../entities/account.entity';

export class CreateAccountDto {
  @ApiProperty({
    example: 'Cuenta Corriente Santander',
    description: 'Nombre de la cuenta'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: AccountType,
    example: AccountType.ASSET,
    description: 'Tipo de cuenta'
  })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiPropertyOptional({
    example: 'ES9121000418450200051332',
    description: 'Número IBAN de la cuenta'
  })
  @IsOptional()
  @IsString()
  iban?: string;

  @ApiPropertyOptional({
    example: '1234567890',
    description: 'Número de cuenta'
  })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({
    example: 'EUR',
    description: 'Código de la moneda por defecto'
  })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional({
    example: 1000.50,
    description: 'Balance inicial de la cuenta'
  })
  @IsOptional()
  @IsNumber()
  initialBalance?: number;

  @ApiPropertyOptional({
    example: 'Cuenta principal para gastos diarios',
    description: 'Descripción o notas de la cuenta'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Si la cuenta está activa',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Si la cuenta incluye datos en reportes',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  includeNetWorth?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Orden de visualización'
  })
  @IsOptional()
  @IsNumber()
  order?: number;
}