import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString, IsArray, ValidateNested, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TransactionType {
  WITHDRAWAL = 'withdrawal', // Gasto: de asset a expense
  DEPOSIT = 'deposit',       // Ingreso: de revenue a asset
  TRANSFER = 'transfer',     // Transferencia: entre assets
}

export class TransactionSplitDto {
  @ApiProperty({
    example: 'uuid-source-account',
    description: 'ID de la cuenta origen'
  })
  @IsUUID()
  @IsNotEmpty()
  sourceAccountId: string;

  @ApiProperty({
    example: 'uuid-destination-account', 
    description: 'ID de la cuenta destino'
  })
  @IsUUID()
  @IsNotEmpty()
  destinationAccountId: string;

  @ApiProperty({
    example: 25.50,
    description: 'Monto de la transacción'
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({
    example: 'Almuerzo en restaurante',
    description: 'Descripción específica de este split'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'uuid-category',
    description: 'ID de la categoría'
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'EUR',
    description: 'Código de moneda'
  })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Código de moneda extranjera'
  })
  @IsOptional()
  @IsString()
  foreignCurrencyCode?: string;

  @ApiPropertyOptional({
    example: 27.30,
    description: 'Monto en moneda extranjera'
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  foreignAmount?: number;
}

export class CreateTransactionDto {
  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.WITHDRAWAL,
    description: 'Tipo de transacción'
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    example: 'Compras del supermercado',
    description: 'Descripción principal de la transacción'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Fecha de la transacción (YYYY-MM-DD)'
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    type: [TransactionSplitDto],
    description: 'Lista de splits de la transacción'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionSplitDto)
  splits: TransactionSplitDto[];

  @ApiPropertyOptional({
    example: 'Compras mensuales de comida',
    description: 'Notas adicionales'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: ['comida', 'hogar', 'mensual'],
    description: 'Etiquetas de la transacción'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    example: 'REF-2024-001',
    description: 'Referencia externa'
  })
  @IsOptional()
  @IsString()
  externalReference?: string;

  @ApiPropertyOptional({
    example: 'INT-2024-001',
    description: 'Referencia interna'
  })
  @IsOptional()
  @IsString()
  internalReference?: string;
}