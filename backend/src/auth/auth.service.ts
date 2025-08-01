import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { UsersService } from '../users/users.service';
import { User, UserStatus } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthResponse {
  user: Partial<User>;
  accessToken: string;
  expiresIn: number;
}

export interface TwoFactorSetupResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, confirmPassword } = registerDto;

    // Verificar que las contraseñas coincidan
    if (password !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Verificar si el usuario ya existe
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Usuario con este email ya existe');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      username: email.split('@')[0], // Generar username temporal
      firstName: '',
      lastName: '',
    });

    // Generar token
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      expiresIn: this.parseExpirationTime(this.configService.get<string>('auth.jwt.accessTokenExpiresIn', '15m')),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password, mfaCode } = loginDto;

    // Validar usuario y contraseña
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar 2FA si está habilitado
    if (user.twoFactorEnabled) {
      if (!mfaCode) {
        throw new UnauthorizedException('Código 2FA requerido');
      }

      const isValidMfa = this.verifyTwoFactorCode(user.twoFactorSecret, mfaCode);
      if (!isValidMfa) {
        throw new UnauthorizedException('Código 2FA inválido');
      }
    }

    // Actualizar último login
    await this.usersService.updateLastLogin(user.id, '', ''); // IP y UserAgent vacíos por ahora

    // Generar token
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      expiresIn: this.parseExpirationTime(this.configService.get<string>('auth.jwt.accessTokenExpiresIn', '15m')),
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmailWithPassword(email);
    
    if (!user) {
      return null;
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Usuario no activo');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async setupTwoFactor(userId: string): Promise<TwoFactorSetupResponse> {
    const user = await this.usersService.findOne(userId);
    
    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA ya está habilitado');
    }

    // Generar secret
    const secret = speakeasy.generateSecret({
      name: `Firefly III Clone (${user.email})`,
      issuer: 'Firefly III Clone',
      length: 32,
    });

    // Generar códigos de backup
    const backupCodes = this.generateBackupCodes();

    // Guardar secret temporal (se confirma cuando se verifica)
    await this.usersService.updateTwoFactorSecret(userId, secret.base32);

    // Generar QR Code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      qrCode,
      secret: secret.base32,
      backupCodes,
    };
  }

  async enableTwoFactor(userId: string, code: string): Promise<void> {
    const user = await this.usersService.findOne(userId);
    
    if (!user.twoFactorSecret) {
      throw new BadRequestException('Debe configurar 2FA primero');
    }

    const isValidCode = this.verifyTwoFactorCode(user.twoFactorSecret, code);
    if (!isValidCode) {
      throw new BadRequestException('Código 2FA inválido');
    }

    await this.usersService.enableTwoFactor(userId, user.twoFactorSecret, []);
  }

  async disableTwoFactor(userId: string, code: string): Promise<void> {
    const user = await this.usersService.findOne(userId);
    
    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA no está habilitado');
    }

    const isValidCode = this.verifyTwoFactorCode(user.twoFactorSecret, code);
    if (!isValidCode) {
      throw new BadRequestException('Código 2FA inválido');
    }

    await this.usersService.disableTwoFactor(userId);
  }

  private verifyTwoFactorCode(secret: string, code: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2, // Permite 2 períodos de tiempo antes/después
    });
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substr(2, 8).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  private sanitizeUser(user: User): Partial<User> {
    const { password, twoFactorSecret, ...sanitized } = user;
    return sanitized;
  }

  private parseExpirationTime(timeString: string): number {
    // Convierte strings como '15m', '1h', '7d' a segundos
    const match = timeString.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutos
    
    const value = parseInt(match[1], 10);
    const unit = match[2];
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: return 900;
    }
  }
}