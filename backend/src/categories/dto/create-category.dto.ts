import { IsString, IsNotEmpty, IsOptional, IsHexColor, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Alimentación',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
    example: 'Gastos relacionados con comida y bebidas',
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Color hexadecimal para la categoría',
    example: '#FF5722',
    pattern: '^#[0-9A-Fa-f]{6}$'
  })
  @IsHexColor()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    description: 'ID de la categoría padre (para subcategorías)',
    example: 'uuid-example-string'
  })
  @IsOptional()
  parentId?: string;
}