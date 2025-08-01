import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Category } from './entities/category.entity';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nueva categoría',
    description: 'Crea una nueva categoría financiera para el usuario autenticado',
  })
  @ApiResponse({
    status: 201,
    description: 'Categoría creada exitosamente',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o categoría duplicada',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría padre no encontrada',
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() user: User,
  ): Promise<Category> {
    return await this.categoriesService.create(createCategoryDto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas las categorías',
    description: 'Obtiene todas las categorías del usuario autenticado',
  })
  @ApiQuery({
    name: 'tree',
    required: false,
    type: Boolean,
    description: 'Si es true, devuelve las categorías en estructura de árbol',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías obtenida exitosamente',
    type: [Category],
  })
  async findAll(
    @CurrentUser() user: User,
    @Query('tree') tree?: boolean,
  ): Promise<Category[]> {
    if (tree) {
      return await this.categoriesService.findTree(user);
    }
    return await this.categoriesService.findAll(user);
  }

  @Get('root')
  @ApiOperation({
    summary: 'Obtener categorías raíz',
    description: 'Obtiene todas las categorías que no tienen padre (categorías principales)',
  })
  @ApiResponse({
    status: 200,
    description: 'Categorías raíz obtenidas exitosamente',
    type: [Category],
  })
  async findRootCategories(@CurrentUser() user: User): Promise<Category[]> {
    return await this.categoriesService.findRootCategories(user);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar categorías por nombre',
    description: 'Busca categorías que coincidan con el nombre especificado',
  })
  @ApiQuery({
    name: 'name',
    required: true,
    type: String,
    description: 'Nombre de la categoría a buscar',
  })
  @ApiResponse({
    status: 200,
    description: 'Categorías encontradas exitosamente',
    type: [Category],
  })
  async findByName(
    @CurrentUser() user: User,
    @Query('name') name: string,
  ): Promise<Category[]> {
    return await this.categoriesService.findByName(name, user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener categoría por ID',
    description: 'Obtiene una categoría específica por su ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID único de la categoría',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría obtenida exitosamente',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Category> {
    return await this.categoriesService.findOne(id, user);
  }

  @Get(':id/subcategories')
  @ApiOperation({
    summary: 'Obtener subcategorías',
    description: 'Obtiene todas las subcategorías de una categoría específica',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la categoría padre',
  })
  @ApiResponse({
    status: 200,
    description: 'Subcategorías obtenidas exitosamente',
    type: [Category],
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría padre no encontrada',
  })
  async findSubcategories(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<Category[]> {
    return await this.categoriesService.findSubcategories(id, user);
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Obtener estadísticas de categoría',
    description: 'Obtiene estadísticas detalladas de una categoría (transacciones, montos, subcategorías)',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la categoría',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        category: { $ref: '#/components/schemas/Category' },
        transactionCount: { type: 'number', example: 25 },
        totalAmount: { type: 'number', example: 1250.50 },
        subcategoryCount: { type: 'number', example: 3 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async getCategoryStats(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{
    category: Category;
    transactionCount: number;
    totalAmount: number;
    subcategoryCount: number;
  }> {
    return await this.categoriesService.getCategoryStats(id, user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar categoría',
    description: 'Actualiza los datos de una categoría existente',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID único de la categoría',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada exitosamente',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o referencia circular detectada',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user: User,
  ): Promise<Category> {
    return await this.categoriesService.update(id, updateCategoryDto, user);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar categoría',
    description: 'Elimina una categoría. No se puede eliminar si tiene subcategorías o transacciones asociadas',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID único de la categoría',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría eliminada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar: tiene subcategorías o transacciones asociadas',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    await this.categoriesService.remove(id, user);
    return { message: 'Categoría eliminada exitosamente' };
  }
}