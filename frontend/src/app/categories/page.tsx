'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Grid, List, TreePine } from 'lucide-react';
import Link from 'next/link';
import { useCategoryStore } from '@/stores/categoryStore';
import { CategoryTreeNode, Category } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import TreeView from '@/components/ui/TreeView';

type ViewMode = 'tree' | 'grid' | 'list';

export default function CategoriesPage() {
  const {
    categories,
    categoryTree,
    loading,
    error,
    filters,
    fetchCategories,
    fetchCategoryTree,
    setFilters,
    clearFilters,
    toggleCategoryExpansion,
    reorderCategoriesDragDrop,
  } = useCategoryStore();

  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (viewMode === 'tree') {
      fetchCategoryTree();
    } else {
      fetchCategories();
    }
  }, [viewMode, fetchCategories, fetchCategoryTree]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters({ search: query });
  };

  const filteredCategories = categories.filter(category => {
    if (filters.search) {
      return category.name.toLowerCase().includes(filters.search.toLowerCase()) ||
             category.description?.toLowerCase().includes(filters.search.toLowerCase());
    }
    return true;
  });

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Categorías</h1>
          <p className="text-gray-400 mt-1">
            Organiza tus gastos e ingresos con categorías jerárquicas
          </p>
        </div>
        <Link href="/categories/new">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
          </Button>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
        >
          <p className="text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar categorías..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View Mode and Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Vista:</span>
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    viewMode === 'tree'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <TreePine className="w-4 h-4" />
                  <span>Árbol</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span>Cuadrícula</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    viewMode === 'list'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>Lista</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-400"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              {(filters.search || filters.parentId || filters.hasParent !== undefined) && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="text-gray-400"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700"
            >
              <Select
                options={[
                  { value: 'all', label: 'Todas las categorías' },
                  { value: 'root', label: 'Solo categorías principales' },
                  { value: 'subcategories', label: 'Solo subcategorías' }
                ]}
                value={filters.hasParent === true ? 'subcategories' : filters.hasParent === false ? 'root' : 'all'}
                onChange={(value: string) =>
                  setFilters({
                    hasParent: value === 'subcategories' ? true : value === 'root' ? false : undefined
                  })
                }
              />

              <Select
                options={[
                  { value: 'all', label: 'Todas' },
                  { value: 'active', label: 'Activas' },
                  { value: 'inactive', label: 'Inactivas' }
                ]}
                value={filters.active === true ? 'active' : filters.active === false ? 'inactive' : 'all'}
                onChange={(value: string) =>
                  setFilters({
                    active: value === 'active' ? true : value === 'inactive' ? false : undefined
                  })
                }
              />
            </motion.div>
          )}
        </div>
      </Card>

      {/* Categories Content */}
      {viewMode === 'tree' && (
        <Card className="p-6">
          <TreeView
            data={categoryTree}
            onToggleExpansion={toggleCategoryExpansion}
            searchQuery={searchQuery}
            onNodeToggleActive={(node) => {
              // Handle toggle active state
              console.log('Toggle active for:', node.name);
            }}
            onReorderCategories={reorderCategoriesDragDrop}
            showActions={true}
            enableDragDrop={true}
          />
        </Card>
      )}

      {viewMode === 'grid' && (
        <CategoryGridView
          categories={filteredCategories}
          loading={loading}
        />
      )}

      {viewMode === 'list' && (
        <CategoryListView
          categories={filteredCategories}
          loading={loading}
        />
      )}

      {/* Empty State */}
      {!loading && filteredCategories.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <TreePine className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            {searchQuery ? 'No se encontraron categorías' : 'No hay categorías'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchQuery
              ? `No hay categorías que coincidan con "${searchQuery}"`
              : 'Comienza creando tu primera categoría para organizar tus transacciones'
            }
          </p>
          {!searchQuery && (
            <Link href="/categories/new">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Categoría
              </Button>
            </Link>
          )}
        </motion.div>
      )}
    </div>
  );
}


// Grid View Component
function CategoryGridView({
  categories,
  loading,
}: {
  categories: Category[];
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-4 h-full hover:border-purple-500 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                {category.color && (
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{category.name}</h3>
                  {category.parent && (
                    <p className="text-xs text-gray-400 truncate">
                      {category.parent.name}
                    </p>
                  )}
                </div>
              </div>
              
              {category.description && (
                <p className="text-sm text-gray-400 line-clamp-2">
                  {category.description}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  {!category.active && (
                    <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded">
                      Inactiva
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/categories/${category.id}`}
                    className="text-purple-400 hover:text-purple-300 text-sm"
                  >
                    Ver
                  </Link>
                  <Link
                    href={`/categories/${category.id}/edit`}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// List View Component
function CategoryListView({
  categories,
  loading,
}: {
  categories: Category[];
  loading: boolean;
}) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4 p-4 rounded-lg border border-gray-700 bg-gray-800/50 hover:bg-gray-800 transition-colors"
          >
            {category.color && (
              <div
                className="w-6 h-6 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-white">{category.name}</h3>
                {!category.active && (
                  <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded">
                    Inactiva
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                {category.parent && (
                  <span>Padre: {category.parent.name}</span>
                )}
                {category.description && (
                  <span className="truncate">{category.description}</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link
                href={`/categories/${category.id}`}
                className="text-purple-400 hover:text-purple-300 text-sm"
              >
                Ver
              </Link>
              <Link
                href={`/categories/${category.id}/edit`}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Editar
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}