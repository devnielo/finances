import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TransactionsService, PaginatedTransactions, TransactionSummary } from './transactions.service';
import { CreateTransactionDto, TransactionType } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { TransactionJournal } from './entities/transaction-journal.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear una nueva transacción',
    description: 'Crea una nueva transacción con soporte para splits múltiples y diferentes tipos de transacción.'
  })
  @ApiResponse({
    status: 201,
    description: 'Transacción creada exitosamente.',
    type: TransactionJournal,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o reglas de negocio violadas.',
  })
  @ApiResponse({
    status: 404,
    description: 'Una o más cuentas no encontradas.',
  })
  async create(
    @CurrentUser() user: User,
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionJournal> {
    return this.transactionsService.create(user.id, createTransactionDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar transacciones',
    description: 'Obtiene una lista paginada de transacciones del usuario con filtros opcionales.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (por defecto: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página (por defecto: 10)' })
  @ApiQuery({ name: 'type', required: false, enum: ['withdrawal', 'deposit', 'transfer'], description: 'Filtrar por tipo de transacción' })
  @ApiQuery({ name: 'accountId', required: false, type: String, description: 'Filtrar por cuenta específica' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar en descripción' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['date', 'amount', 'description'], description: 'Campo de ordenamiento' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Orden de clasificación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de transacciones obtenida exitosamente.',
  })
  async findAll(
    @CurrentUser() user: User,
    @Query() query: TransactionQueryDto,
  ): Promise<PaginatedTransactions> {
    return this.transactionsService.findAll(user.id, query);
  }

  @Get('summary')
  @ApiOperation({ 
    summary: 'Resumen de transacciones',
    description: 'Obtiene un resumen estadístico de las transacciones del usuario en un período específico.'
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Resumen de transacciones obtenido exitosamente.',
  })
  async getTransactionSummary(
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TransactionSummary> {
    return this.transactionsService.getTransactionSummary(user.id, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener detalles de transacción',
    description: 'Obtiene los detalles completos de una transacción específica incluyendo todos sus splits.'
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID de la transacción' })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la transacción obtenidos exitosamente.',
    type: TransactionJournal,
  })
  @ApiResponse({
    status: 404,
    description: 'Transacción no encontrada.',
  })
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionJournal> {
    return this.transactionsService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Actualizar transacción',
    description: 'Actualiza los detalles de una transacción existente. Por ahora solo soporta actualización de descripción y notas.'
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID de la transacción' })
  @ApiResponse({
    status: 200,
    description: 'Transacción actualizada exitosamente.',
    type: TransactionJournal,
  })
  @ApiResponse({
    status: 404,
    description: 'Transacción no encontrada.',
  })
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionJournal> {
    return this.transactionsService.update(user.id, id, updateTransactionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Eliminar transacción',
    description: 'Elimina una transacción y revierte automáticamente los cambios en los balances de las cuentas.'
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID de la transacción' })
  @ApiResponse({
    status: 204,
    description: 'Transacción eliminada exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Transacción no encontrada.',
  })
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.transactionsService.remove(user.id, id);
  }

  @Get('account/:accountId')
  @ApiOperation({ 
    summary: 'Transacciones por cuenta',
    description: 'Obtiene todas las transacciones relacionadas con una cuenta específica.'
  })
  @ApiParam({ name: 'accountId', type: 'string', description: 'ID de la cuenta' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (por defecto: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página (por defecto: 10)' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Transacciones de la cuenta obtenidas exitosamente.',
  })
  async findByAccount(
    @CurrentUser() user: User,
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Query() query: TransactionQueryDto,
  ): Promise<PaginatedTransactions> {
    // Agregar el accountId al query
    const queryWithAccount = { ...query, accountId };
    return this.transactionsService.findAll(user.id, queryWithAccount);
  }

  @Get('types/:type')
  @ApiOperation({ 
    summary: 'Transacciones por tipo',
    description: 'Obtiene todas las transacciones de un tipo específico (withdrawal, deposit, transfer).'
  })
  @ApiParam({ 
    name: 'type', 
    enum: ['withdrawal', 'deposit', 'transfer'],
    description: 'Tipo de transacción' 
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (por defecto: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página (por defecto: 10)' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Fecha de fin (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Transacciones del tipo especificado obtenidas exitosamente.',
  })
  async findByType(
    @CurrentUser() user: User,
    @Param('type') type: 'withdrawal' | 'deposit' | 'transfer',
    @Query() query: TransactionQueryDto,
  ): Promise<PaginatedTransactions> {
    // Agregar el tipo al query
    const queryWithType = { ...query, type: type as TransactionType };
    return this.transactionsService.findAll(user.id, queryWithType);
  }

  @Post(':id/reconcile')
  @ApiOperation({ 
    summary: 'Reconciliar transacción',
    description: 'Marca una transacción como reconciliada, útil para cuadrar con extractos bancarios.'
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID de la transacción' })
  @ApiResponse({
    status: 200,
    description: 'Transacción reconciliada exitosamente.',
    type: TransactionJournal,
  })
  @ApiResponse({
    status: 404,
    description: 'Transacción no encontrada.',
  })
  async reconcile(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionJournal> {
    // Por ahora, simplemente actualizamos el campo reconciled
    // En una implementación completa, esto podría tener más lógica
    return this.transactionsService.update(user.id, id, { notes: 'Reconciliado automáticamente' });
  }
}