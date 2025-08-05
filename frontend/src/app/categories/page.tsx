'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Grid, List, TreePine } from 'lucide-react';
import Link from 'next/link';
import { useCategoryStore } from '@/stores/categoryStore';
import { CategoryTreeNode, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
// import TreeView from '@/components/ui/TreeView'; // Componente pendiente de implementar

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground mt-1">
            Organiza tus gastos e ingresos con categorías jerárquicas
          </p>
        </div>
        <Link href="/categories/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
          </Button>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar y Filtrar</CardTitle>
          <CardDescription>
            Encuentra y organiza tus categorías
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div>
            <Label htmlFor="search">Buscar categorías</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search"
                type="text"
                placeholder="Buscar categorías..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* View Mode and Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium">Vista:</Label>
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tree" className="flex items-center gap-2">
                    <TreePine className="w-4 h-4" />
                    Árbol
                  </TabsTrigger>
                  <TabsTrigger value="grid" className="flex items-center gap-2">
                    <Grid className="w-4 h-4" />
                    Cuadrícula
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Lista
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              {(filters.search || filters.parentId || filters.hasParent !== undefined) && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleContent className="space-y-4">
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="categoryType">Tipo de categoría</Label>
                  <Select
                    value={filters.hasParent === true ? 'subcategories' : filters.hasParent === false ? 'root' : 'all'}
                    onValueChange={(value: string) =>
                      setFilters({
                        hasParent: value === 'subcategories' ? true : value === 'root' ? false : undefined
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      <SelectItem value="root">Solo categorías principales</SelectItem>
                      <SelectItem value="subcategories">Solo subcategorías</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={filters.active === true ? 'active' : filters.active === false ? 'inactive' : 'all'}
                    onValueChange={(value: string) =>
                      setFilters({
                        active: value === 'active' ? true : value === 'inactive' ? false : undefined
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="active">Activas</SelectItem>
                      <SelectItem value="inactive">Inactivas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Categories Content */}
      <Tabs value={viewMode} className="w-full">
        <TabsContent value="tree">
          <Card>
            <CardHeader>
              <CardTitle>Vista de Árbol</CardTitle>
              <CardDescription>
                Organización jerárquica de categorías
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TreePine className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Vista de árbol en desarrollo. Por ahora, usa las vistas de cuadrícula o lista.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grid">
          <CategoryGridView
            categories={filteredCategories}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="list">
          <CategoryListView
            categories={filteredCategories}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {!loading && filteredCategories.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <TreePine className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery ? 'No se encontraron categorías' : 'No hay categorías'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? `No hay categorías que coincidan con "${searchQuery}"`
              : 'Comienza creando tu primera categoría para organizar tus transacciones'
            }
          </p>
          {!searchQuery && (
            <Link href="/categories/new">
              <Button>
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
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                {category.color && (
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 border"
                    style={{ backgroundColor: category.color }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{category.name}</CardTitle>
                  {category.parent && (
                    <p className="text-xs text-muted-foreground truncate">
                      {category.parent.name}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {category.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  {!category.active && (
                    <Badge variant="secondary">
                      Inactiva
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Link href={`/categories/${category.id}`}>
                    <Button variant="ghost" size="sm">
                      Ver
                    </Button>
                  </Link>
                  <Link href={`/categories/${category.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
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
  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-4">
              <Skeleton className="w-6 h-6 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="space-y-1">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4 p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0"
            >
              {category.color && (
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0 border"
                  style={{ backgroundColor: category.color }}
                />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">{category.name}</h3>
                  {!category.active && (
                    <Badge variant="secondary">
                      Inactiva
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {category.parent && (
                    <span>Padre: {category.parent.name}</span>
                  )}
                  {category.description && (
                    <span className="truncate">{category.description}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link href={`/categories/${category.id}`}>
                  <Button variant="ghost" size="sm">
                    Ver
                  </Button>
                </Link>
                <Link href={`/categories/${category.id}/edit`}>
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}