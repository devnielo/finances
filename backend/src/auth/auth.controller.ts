import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody 
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EnableTwoFactorDto, VerifyTwoFactorDto, DisableTwoFactorDto } from './dto/two-factor.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'user@example.com',
          username: 'user',
          role: 'user',
          status: 'pending_verification'
        },
        accessToken: 'jwt-token',
        expiresIn: 3600
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos'
  })
  @ApiResponse({
    status: 409,
    description: 'Usuario ya existe'
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'user@example.com',
          username: 'user',
          role: 'user',
          status: 'active'
        },
        accessToken: 'jwt-token',
        expiresIn: 3600
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas'
  })
  async login(@Body() loginDto: LoginDto, @CurrentUser() user: User) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        username: 'user',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        status: 'active',
        twoFactorEnabled: false
      }
    }
  })
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Configurar 2FA (Two-Factor Authentication)' })
  @ApiResponse({
    status: 200,
    description: '2FA configurado, devuelve QR code y códigos de backup',
    schema: {
      example: {
        qrCode: 'data:image/png;base64,...',
        secret: 'JBSWY3DPEHPK3PXP',
        backupCodes: ['ABCD1234', 'EFGH5678', '...']
      }
    }
  })
  async setupTwoFactor(@CurrentUser() user: User) {
    return this.authService.setupTwoFactor(user.id);
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Habilitar 2FA con código de verificación' })
  @ApiResponse({
    status: 200,
    description: '2FA habilitado exitosamente'
  })
  @ApiResponse({
    status: 400,
    description: 'Código 2FA inválido'
  })
  async enableTwoFactor(
    @CurrentUser() user: User,
    @Body() enableTwoFactorDto: EnableTwoFactorDto
  ) {
    await this.authService.enableTwoFactor(user.id, enableTwoFactorDto.code);
    return { message: '2FA habilitado exitosamente' };
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar código 2FA' })
  @ApiResponse({
    status: 200,
    description: 'Código 2FA válido'
  })
  @ApiResponse({
    status: 400,
    description: 'Código 2FA inválido'
  })
  async verifyTwoFactor(
    @CurrentUser() user: User,
    @Body() verifyTwoFactorDto: VerifyTwoFactorDto
  ) {
    // Este endpoint se puede usar para verificar códigos 2FA en operaciones sensibles
    const isValid = await this.authService['verifyTwoFactorCode'](
      user.twoFactorSecret, 
      verifyTwoFactorDto.code
    );
    
    if (!isValid) {
      return { valid: false, message: 'Código 2FA inválido' };
    }
    
    return { valid: true, message: 'Código 2FA válido' };
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deshabilitar 2FA' })
  @ApiResponse({
    status: 200,
    description: '2FA deshabilitado exitosamente'
  })
  @ApiResponse({
    status: 400,
    description: 'Código 2FA inválido o 2FA no está habilitado'
  })
  async disableTwoFactor(
    @CurrentUser() user: User,
    @Body() disableTwoFactorDto: DisableTwoFactorDto
  ) {
    await this.authService.disableTwoFactor(user.id, disableTwoFactorDto.code);
    return { message: '2FA deshabilitado exitosamente' };
  }
}