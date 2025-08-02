'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit, Trash2, Plus, Eye, EyeOff, 
  TreePine, BarChart3, Calendar, TrendingUp, TrendingDown,
  Users, Target, AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';
import { useCategoryStore } from '@/stores/categoryStore';
import { Category, CategoryStats } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params?.id as string;

  const {
    selectedCategory: category,
    categoryStats,
    categories,
    loading,
    error,
    fetchCategory,
    fetchCategoryStats,
    deleteCategory,
    updateCategory,
    getCategoryChildren,
    getCategoryPath,
    clearSelectedCategory,
    clearError,
  } = useCategoryStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (categoryId) {
      fetchCategory(categoryId);
      fetchCategoryStats(categoryId);
    }
    clearError();

    return () => {
      clearSelectedCategory();
    };
  }, [categoryId, fetchCategory, fetchCategoryStats, clearError, clearSelectedCategory]);

  const handleDelete = async () => {
    if (!category) return;

    setIsDeleting(true);
    try {
      await deleteCategory(category.id);
      router.push('/categories');
    } catch (error) {
      console.error('Error deleting category:', error);
      // Error is handled by the store
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleToggleActive = async () => {
    if (!category) return;

    try {
      await updateCategory(category.id, {
        active: !category.active,
      });
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  if (loading && !category) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error && !category) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">Error al cargar categoría</h3>
        <p className="text-gray-400 mb-6">{error}</p>
        <Link href="/categories">
          <Button variant="outline">Volver a Categorías</Button>
        </Link>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <TreePine className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">Categoría no encontrada</h3>
        <p className="text-gray-400 mb-6">La categoría que buscas no existe o ha sido eliminada.</p>
        <Link href="/categories">
          <Button variant="outline">Volver a Categorías</Button>
        </Link>
      </div>
    );
  }

  const categoryPath = getCategoryPath(category.id);
  const children = getCategoryChildren(category.id);
  const canDelete = children.length === 0 && (!categoryStats || categoryStats.transactionCount === 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/categories"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          
          <div className="flex items-center space-x-3">
            {category.color && (
              <div
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: category.color }}
              />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-bold text-white">{category.name}</h1>
                {!category.active && (
                  <span className="px-2 py-1 bg-gray-600 text-gray-300 text-sm rounded">
                    Inactiva
                  </span>
                )}
              </div>
              
              {/* Breadcrumb */}
              {categoryPath.length > 1 && (
                <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                  {categoryPath.slice(0, -1).map((pathCategory, index) => (
                    <div key={pathCategory.id} className="flex items-center space-x-2">
                      <Link
                        href={`/categories/${pathCategory.id}`}
                        className="hover:text-purple-400 transition-colors"
                      >
                        {pathCategory.name}
                      </Link>
                      <span>›</span>
                    </div>
                  ))}
                  <span className="text-white font-medium">{category.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleToggleActive}
            className="text-gray-400"
          >
            {category.active ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Desactivar
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Activar
              </>
            )}
          </Button>
          
          <Link href={`/categories/${category.id}/edit`}>
            <Button variant="outline" className="text-blue-400">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
          
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            disabled={!canDelete}
            className="text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Información</h2>
            
            <div className="space-y-4">
              {category.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Descripción
                  </label>
                  <p className="text-gray-300">{category.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Estado
                  </label>
                  <span className={`inline-flex px-2 py-1 text-sm rounded ${
                    category.active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {category.active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Tipo
                  </label>
                  <span className="text-gray-300">
                    {category.parentId ? 'Subcategoría' : 'Categoría principal'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Creada
                  </label>
                  <span className="text-gray-300">
                    {new Date(category.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Última actualización
                  </label>
                  <span className="text-gray-300">
                    {new Date(category.updatedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          {categoryStats && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Estadísticas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-gray-400">Transacciones</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {categoryStats.transactionCount}
                  </p>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-400">Monto Total</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    €{categoryStats.totalAmount.toLocaleString('es-ES', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TreePine className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-gray-400">Subcategorías</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {categoryStats.subcategoryCount}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Subcategories */}
          {children.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Subcategorías ({children.length})
                </h2>
                <Link href={`/categories/new?parentId=${category.id}`}>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Subcategoría
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-3">
                {children.map((child) => (
                  <motion.div
                    key={child.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {child.color && (
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: child.color }}
                        />
                      )}
                      <div>
                        <h3 className="font-medium text-white">{child.name}</h3>
                        {child.description && (
                          <p className="text-sm text-gray-400">{child.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!child.active && (
                        <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded">
                          Inactiva
                        </span>
                      )}
                      <Link
                        href={`/categories/${child.id}`}
                        className="text-purple-400 hover:text-purple-300 text-sm"
                      >
                        Ver
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
            
            <div className="space-y-3">
              <Link href={`/categories/${category.id}/edit`}>
                <Button className="w-full justify-start" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Categoría
                </Button>
              </Link>
              
              {category.parentId === null && (
                <Link href={`/categories/new?parentId=${category.id}`}>
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Subcategoría
                  </Button>
                </Link>
              )}
              
              <Link href={`/transactions?categoryId=${category.id}`}>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Ver Transacciones
                </Button>
              </Link>
            </div>
          </Card>

          {/* Category Hierarchy */}
          {category.parentId && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Jerarquía</h3>
              
              <div className="space-y-2">
                {categoryPath.map((pathCategory, index) => (
                  <div key={pathCategory.id} className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 text-sm">
                      {'  '.repeat(index)}
                      {index > 0 && <span className="text-gray-500">└─</span>}
                      {pathCategory.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: pathCategory.color }}
                        />
                      )}
                      <Link
                        href={`/categories/${pathCategory.id}`}
                        className={
                          pathCategory.id === category.id
                            ? 'text-white font-medium'
                            : 'text-purple-400 hover:text-purple-300'
                        }
                      >
                        {pathCategory.name}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Deletion Warning */}
          {!canDelete && (
            <Card className="p-6 border-amber-500/20 bg-amber-500/5">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-400 mb-2">No se puede eliminar</h3>
                  <div className="text-sm text-amber-300 space-y-1">
                    {children.length > 0 && (
                      <p>• Tiene {children.length} subcategoría(s)</p>
                    )}
                    {categoryStats && categoryStats.transactionCount > 0 && (
                      <p>• Tiene {categoryStats.transactionCount} transacción(es) asociada(s)</p>
                    )}
                    <p className="mt-2 text-amber-200">
                      Elimina las subcategorías y transacciones primero.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            ¿Estás seguro de que quieres eliminar la categoría &quot;{category.name}&quot;?
          </p>
          <p className="text-sm text-gray-400">
            Esta acción no se puede deshacer.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}