import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnableTwoFactorDto {
  @ApiProperty({
    example: '123456',
    description: 'Código de verificación 2FA de 6 dígitos'
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  code: string;
}

export class VerifyTwoFactorDto {
  @ApiProperty({
    example: '123456',
    description: 'Código de verificación 2FA de 6 dígitos'
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  code: string;
}

export class DisableTwoFactorDto {
  @ApiProperty({
    example: '123456',
    description: 'Código de verificación 2FA de 6 dígitos'
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  code: string;
}