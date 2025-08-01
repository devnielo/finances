import { IsOptional, IsDateString, IsEnum, IsUUID, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from './create-transaction.dto';

export class TransactionQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Número de página',
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    description: 'Elementos por página',
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: TransactionType,
    description: 'Filtrar por tipo de transacción'
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Fecha de inicio (YYYY-MM-DD)'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2024-01-31',
    description: 'Fecha de fin (YYYY-MM-DD)'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 'uuid-account',
    description: 'ID de cuenta específica'
  })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiPropertyOptional({
    example: 'uuid-category',
    description: 'ID de categoría específica'
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'comida',
    description: 'Buscar por texto en descripción'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'date',
    enum: ['date', 'amount', 'description'],
    description: 'Campo para ordenar'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'date';

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc'],
    description: 'Dirección del ordenamiento'
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    example: ['comida', 'hogar'],
    description: 'Filtrar por etiquetas'
  })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}