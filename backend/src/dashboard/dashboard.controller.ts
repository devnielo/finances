import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService, DashboardOverview, AccountSummary, CategorySpending, MonthlyTrend, TransactionsByType } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Obtener resumen general del dashboard',
    description: 'Obtiene un resumen financiero completo incluyendo balances, ingresos, gastos y estadísticas generales',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen del dashboard obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        totalBalance: { type: 'number', example: 15750.25 },
        totalIncome: { type: 'number', example: 5200.00 },
        totalExpenses: { type: 'number', example: 3450.75 },
        netWorth: { type: 'number', example: 15750.25 },
        accountsCount: { type: 'number', example: 4 },
        transactionsCount: { type: 'number', example: 125 },
        categoriesCount: { type: 'number', example: 12 },
        lastTransactionDate: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getOverview(
    @CurrentUser() user: User,
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardOverview> {
    return await this.dashboardService.getOverview(user, query);
  }

  @Get('accounts')
  @ApiOperation({
    summary: 'Obtener resumen de cuentas',
    description: 'Obtiene un resumen de todas las cuentas del usuario con balances y última transacción',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen de cuentas obtenido exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-string' },
          name: { type: 'string', example: 'Cuenta Corriente Principal' },
          type: { type: 'string', example: 'asset' },
          balance: { type: 'number', example: 2500.75 },
          currency: { type: 'string', example: 'USD' },
          lastTransactionDate: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getAccountsSummary(@CurrentUser() user: User): Promise<AccountSummary[]> {
    return await this.dashboardService.getAccountsSummary(user);
  }

  @Get('spending/categories')
  @ApiOperation({
    summary: 'Obtener gastos por categoría',
    description: 'Obtiene un análisis de gastos agrupados por categoría con porcentajes',
  })
  @ApiResponse({
    status: 200,
    description: 'Gastos por categoría obtenidos exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          categoryId: { type: 'string', example: 'uuid-string' },
          categoryName: { type: 'string', example: 'Alimentación' },
          totalAmount: { type: 'number', example: 850.50 },
          transactionCount: { type: 'number', example: 25 },
          percentage: { type: 'number', example: 24.65 },
        },
      },
    },
  })
  async getCategorySpending(
    @CurrentUser() user: User,
    @Query() query: DashboardQueryDto,
  ): Promise<CategorySpending[]> {
    return await this.dashboardService.getCategorySpending(user, query);
  }

  @Get('trends/monthly')
  @ApiOperation({
    summary: 'Obtener tendencias mensuales',
    description: 'Obtiene un análisis de tendencias de ingresos y gastos por mes',
  })
  @ApiQuery({
    name: 'months',
    required: false,
    type: Number,
    description: 'Número de meses hacia atrás a incluir (por defecto: 12)',
    example: 6,
  })
  @ApiResponse({
    status: 200,
    description: 'Tendencias mensuales obtenidas exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          month: { type: 'string', example: '03' },
          year: { type: 'number', example: 2024 },
          income: { type: 'number', example: 4200.00 },
          expenses: { type: 'number', example: 2850.75 },
          net: { type: 'number', example: 1349.25 },
        },
      },
    },
  })
  async getMonthlyTrends(
    @CurrentUser() user: User,
    @Query('months', new ParseIntPipe({ optional: true })) months?: number,
  ): Promise<MonthlyTrend[]> {
    return await this.dashboardService.getMonthlyTrends(user, months);
  }

  @Get('transactions/types')
  @ApiOperation({
    summary: 'Obtener transacciones por tipo',
    description: 'Obtiene el conteo de transacciones agrupadas por tipo (withdrawal, deposit, transfer)',
  })
  @ApiResponse({
    status: 200,
    description: 'Transacciones por tipo obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        withdrawal: { type: 'number', example: 85 },
        deposit: { type: 'number', example: 32 },
        transfer: { type: 'number', example: 8 },
      },
    },
  })
  async getTransactionsByType(
    @CurrentUser() user: User,
    @Query() query: DashboardQueryDto,
  ): Promise<TransactionsByType> {
    return await this.dashboardService.getTransactionsByType(user, query);
  }

  @Get('transactions/recent')
  @ApiOperation({
    summary: 'Obtener transacciones recientes',
    description: 'Obtiene las transacciones más recientes del usuario',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número máximo de transacciones a devolver (por defecto: 10)',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Transacciones recientes obtenidas exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-string' },
          amount: { type: 'number', example: -125.50 },
          description: { type: 'string', example: 'Compra en supermercado' },
          date: { type: 'string', format: 'date-time' },
          accountName: { type: 'string', example: 'Cuenta Corriente' },
          categoryName: { type: 'string', example: 'Alimentación' },
          type: { type: 'string', example: 'withdrawal' },
        },
      },
    },
  })
  async getRecentTransactions(
    @CurrentUser() user: User,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return await this.dashboardService.getRecentTransactions(user, limit);
  }
}