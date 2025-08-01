import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: TreeRepository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, user: User): Promise<Category> {
    const { parentId, ...categoryData } = createCategoryDto;
    
    let parent: Category | null = null;
    if (parentId) {
      parent = await this.findOne(parentId, user);
      if (!parent) {
        throw new NotFoundException(`Categoría padre con ID ${parentId} no encontrada`);
      }
    }

    // Verificar que no existe una categoría con el mismo nombre para este usuario
    const existingCategory = await this.categoryRepository.findOne({
      where: {
        name: categoryData.name,
        userId: user.id,
        parentId: parent ? parent.id : null
      }
    });

    if (existingCategory) {
      throw new BadRequestException('Ya existe una categoría con este nombre en este nivel');
    }

    const category = this.categoryRepository.create({
      ...categoryData,
      user,
      parent,
    });

    return await this.categoryRepository.save(category);
  }

  async findAll(user: User): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: { userId: user.id },
      relations: ['parent', 'children'],
      order: { name: 'ASC' }
    });
  }

  async findTree(user: User): Promise<Category[]> {
    const trees = await this.categoryRepository.findTrees();
    // Filtrar solo las categorías del usuario
    return trees.filter(tree => tree.userId === user.id);
  }

  async findOne(id: string, user: User): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, userId: user.id },
      relations: ['parent', 'children', 'transactions']
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return category;
  }

  async findByName(name: string, user: User): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: {
        userId: user.id,
        name: name
      },
      relations: ['parent', 'children']
    });
  }

  async findRootCategories(user: User): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: {
        userId: user.id,
        parentId: null
      },
      relations: ['children'],
      order: { name: 'ASC' }
    });
  }

  async findSubcategories(parentId: string, user: User): Promise<Category[]> {
    const parent = await this.findOne(parentId, user);
    
    return await this.categoryRepository.find({
      where: {
        parentId: parent.id,
        userId: user.id
      },
      relations: ['children'],
      order: { name: 'ASC' }
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, user: User): Promise<Category> {
    const category = await this.findOne(id, user);
    
    const { parentId, ...updateData } = updateCategoryDto;

    // Si se está cambiando el padre
    if (parentId !== undefined) {
      if (parentId === null) {
        category.parent = null;
      } else {
        // Verificar que el nuevo padre existe y pertenece al usuario
        const newParent = await this.findOne(parentId, user);
        
        // Verificar que no se está creando una referencia circular
        if (await this.wouldCreateCircularReference(category, newParent)) {
          throw new BadRequestException('No se puede crear una referencia circular en las categorías');
        }
        
        category.parent = newParent;
      }
    }

    // Verificar duplicados si se está cambiando el nombre
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: {
          name: updateData.name,
          userId: user.id,
          parentId: category.parent ? category.parent.id : null
        }
      });

      if (existingCategory && existingCategory.id !== category.id) {
        throw new BadRequestException('Ya existe una categoría con este nombre en este nivel');
      }
    }

    Object.assign(category, updateData);
    return await this.categoryRepository.save(category);
  }

  async remove(id: string, user: User): Promise<void> {
    const category = await this.findOne(id, user);

    // Verificar si la categoría tiene subcategorías
    const children = await this.categoryRepository.find({
      where: { parentId: category.id }
    });

    if (children.length > 0) {
      throw new BadRequestException('No se puede eliminar una categoría que tiene subcategorías');
    }

    // Verificar si la categoría tiene transacciones asociadas
    if (category.transactions && category.transactions.length > 0) {
      throw new BadRequestException('No se puede eliminar una categoría que tiene transacciones asociadas');
    }

    await this.categoryRepository.remove(category);
  }

  async getCategoryStats(id: string, user: User): Promise<{
    category: Category;
    transactionCount: number;
    totalAmount: number;
    subcategoryCount: number;
  }> {
    const category = await this.findOne(id, user);
    
    const subcategoryCount = await this.categoryRepository.count({
      where: { parentId: category.id }
    });

    // Calcular estadísticas de transacciones
    const transactionStats = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.transactions', 'transaction')
      .select('COUNT(transaction.id)', 'transactionCount')
      .addSelect('COALESCE(SUM(transaction.amount), 0)', 'totalAmount')
      .where('category.id = :categoryId', { categoryId: id })
      .getRawOne();

    return {
      category,
      transactionCount: parseInt(transactionStats.transactionCount),
      totalAmount: parseFloat(transactionStats.totalAmount),
      subcategoryCount
    };
  }

  private async wouldCreateCircularReference(category: Category, newParent: Category): Promise<boolean> {
    if (category.id === newParent.id) {
      return true;
    }

    let current = newParent;
    while (current.parent) {
      if (current.parent.id === category.id) {
        return true;
      }
      current = await this.categoryRepository.findOne({
        where: { id: current.parent.id },
        relations: ['parent']
      });
    }

    return false;
  }
}