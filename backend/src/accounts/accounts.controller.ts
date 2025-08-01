import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AccountType } from './entities/account.entity';

@ApiTags('Accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva cuenta' })
  @ApiResponse({
    status: 201,
    description: 'Cuenta creada exitosamente',
    schema: {
      example: {
        id: 'uuid',
        name: 'Cuenta Corriente Santander',
        type: 'asset',
        accountNumber: '1234567890',
        iban: 'ES9121000418450200051332',
        currentBalance: 1000.50,
        virtualBalance: 1000.50,
        currencyCode: 'EUR',
        active: true,
        includeNetWorth: true,
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una cuenta con este nombre o IBAN'
  })
  async create(
    @CurrentUser() user: User,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.accountsService.create(user.id, createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las cuentas del usuario' })
  @ApiQuery({
    name: 'type',
    enum: AccountType,
    required: false,
    description: 'Filtrar por tipo de cuenta',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cuentas del usuario',
    schema: {
      example: [
        {
          id: 'uuid',
          name: 'Cuenta Corriente',
          type: 'asset',
          currentBalance: 1500.00,
          currencyCode: 'EUR',
          active: true
        },
        {
          id: 'uuid2',
          name: 'Supermercado',
          type: 'expense',
          currentBalance: 0,
          currencyCode: 'EUR',
          active: true
        }
      ]
    }
  })
  async findAll(
    @CurrentUser() user: User,
    @Query('type') type?: AccountType,
  ) {
    return this.accountsService.findAll(user.id, type);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obtener resumen financiero de las cuentas' })
  @ApiResponse({
    status: 200,
    description: 'Resumen financiero del usuario',
    schema: {
      example: {
        totalAssets: 5000.00,
        totalLiabilities: 1200.00,
        netWorth: 3800.00,
        totalAccounts: 8,
        activeAccounts: 6
      }
    }
  })
  async getAccountSummary(@CurrentUser() user: User) {
    return this.accountsService.getAccountSummary(user.id);
  }

  @Get('types/:type')
  @ApiOperation({ summary: 'Obtener cuentas por tipo' })
  @ApiParam({
    name: 'type',
    enum: AccountType,
    description: 'Tipo de cuenta a filtrar',
  })
  @ApiResponse({
    status: 200,
    description: 'Cuentas del tipo especificado',
  })
  async findByType(
    @CurrentUser() user: User,
    @Param('type') type: AccountType,
  ) {
    return this.accountsService.findByType(user.id, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una cuenta específica' })
  @ApiParam({
    name: 'id',
    description: 'ID único de la cuenta',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la cuenta',
    schema: {
      example: {
        id: 'uuid',
        name: 'Cuenta Corriente Santander',
        type: 'asset',
        accountNumber: '1234567890',
        iban: 'ES9121000418450200051332',
        currentBalance: 1000.50,
        virtualBalance: 1000.50,
        currencyCode: 'EUR',
        currencySymbol: '€',
        currencyDecimalPlaces: 2,
        active: true,
        includeNetWorth: true,
        notes: 'Cuenta principal para gastos diarios',
        metadata: {
          bank: 'Santander',
          color: '#ff0000'
        },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Cuenta no encontrada'
  })
  async findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.accountsService.findOne(user.id, id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Obtener balance actual de una cuenta' })
  @ApiParam({
    name: 'id',
    description: 'ID único de la cuenta',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance actual de la cuenta',
    schema: {
      example: {
        accountId: 'uuid',
        currentBalance: 1000.50,
        availableBalance: 1000.50,
        lastCalculated: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  async getBalance(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.accountsService.getBalance(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una cuenta' })
  @ApiParam({
    name: 'id',
    description: 'ID único de la cuenta',
  })
  @ApiResponse({
    status: 200,
    description: 'Cuenta actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cuenta no encontrada'
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto con nombre o IBAN existente'
  })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(user.id, id, updateAccountDto);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Activar/desactivar una cuenta' })
  @ApiParam({
    name: 'id',
    description: 'ID único de la cuenta',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la cuenta cambiado exitosamente',
  })
  async toggleActive(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.accountsService.toggleActive(user.id, id);
  }

  @Post('reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reordenar cuentas' })
  @ApiResponse({
    status: 200,
    description: 'Cuentas reordenadas exitosamente',
  })
  async reorderAccounts(
    @CurrentUser() user: User,
    @Body() body: { accountOrders: { id: string; order: number }[] },
  ) {
    await this.accountsService.reorderAccounts(user.id, body.accountOrders);
    return { message: 'Cuentas reordenadas exitosamente' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una cuenta' })
  @ApiParam({
    name: 'id',
    description: 'ID único de la cuenta',
  })
  @ApiResponse({
    status: 204,
    description: 'Cuenta eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cuenta no encontrada'
  })
  @ApiResponse({
    status: 403,
    description: 'No se puede eliminar esta cuenta (tiene restricciones)'
  })
  async remove(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    await this.accountsService.remove(user.id, id);
  }
}