import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum DateRange {
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  CURRENT_MONTH = 'current_month',
  LAST_MONTH = 'last_month',
  CURRENT_YEAR = 'current_year',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom',
}

export class DashboardQueryDto {
  @ApiPropertyOptional({
    description: 'Rango de fechas predefinido',
    enum: DateRange,
    example: DateRange.LAST_30_DAYS,
  })
  @IsOptional()
  @IsEnum(DateRange)
  dateRange?: DateRange;

  @ApiPropertyOptional({
    description: 'Fecha de inicio (requerida si dateRange es custom)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de fin (requerida si dateRange es custom)',
    example: '2024-01-31',
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  endDate?: Date;
}