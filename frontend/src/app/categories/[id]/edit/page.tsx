'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCategoryStore } from '@/stores/categoryStore';
import { categorySchema, CategoryFormData, ValidColor, ValidIcon } from '@/lib/validations/categories';
import { UpdateCategoryData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Select from '@/components/ui/Select';
import ColorPicker from '@/components/ui/ColorPicker';
import IconPicker from '@/components/ui/IconPicker';

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params?.id as string;

  const {
    selectedCategory: category,
    categories,
    loading,
    error,
    fetchCategory,
    fetchCategories,
    updateCategory,
    clearSelectedCategory,
    clearError,
  } = useCategoryStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const watchedColor = watch('color');
  const watchedIcon = watch('icon');
  const watchedParentId = watch('parentId');

  useEffect(() => {
    if (categoryId) {
      fetchCategory(categoryId);
      fetchCategories();
    }
    clearError();

    return () => {
      clearSelectedCategory();
    };
  }, [categoryId, fetchCategory, fetchCategories, clearError, clearSelectedCategory]);

  // Reset form when category is loaded
  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        icon: (category.icon as ValidIcon) || undefined,
        color: (category.color as ValidColor) || undefined,
        parentId: category.parentId || undefined,
      });
    }
  }, [category, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    if (!category) return;

    setIsSubmitting(true);
    try {
      const updateData: UpdateCategoryData = {
        name: data.name,
        icon: data.icon || undefined,
        color: data.color || undefined,
        parentId: data.parentId || undefined,
      };

      await updateCategory(category.id, updateData);
      
      // Redirect to category detail on success
      router.push(`/categories/${category.id}`);
    } catch (error) {
      console.error('Error updating category:', error);
      // Error is handled by the store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
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
        <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">Categoría no encontrada</h3>
        <p className="text-gray-400 mb-6">La categoría que intentas editar no existe o ha sido eliminada.</p>
        <Link href="/categories">
          <Button variant="outline">Volver a Categorías</Button>
        </Link>
      </div>
    );
  }

  // Get parent category options (excluding self and descendants)
  const getDescendantIds = (categoryId: string): string[] => {
    const descendants: string[] = [];
    const children = categories.filter(c => c.parentId === categoryId);
    
    children.forEach(child => {
      descendants.push(child.id);
      descendants.push(...getDescendantIds(child.id));
    });
    
    return descendants;
  };

  const excludedIds = [category.id, ...getDescendantIds(category.id)];
  const parentCategoryOptions = categories
    .filter(cat => cat.active && !excludedIds.includes(cat.id))
    .map(cat => ({
      value: cat.id,
      label: cat.fullName || cat.name,
      icon: cat.color ? (
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: cat.color }}
        />
      ) : undefined,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href={`/categories/${category.id}`}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Editar Categoría</h1>
          <p className="text-gray-400 mt-1">
            Modifica los detalles de &quot;{category.name}&quot;
          </p>
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
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Información Básica
                </h2>

                <Input
                  label="Nombre de la categoría"
                  error={errors.name?.message}
                  required
                  {...register('name')}
                  placeholder="Ej: Alimentación, Transporte, Entretenimiento"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    defaultValue={category.description || ''}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Describe para qué usarás esta categoría..."
                  />
                </div>
              </div>

              {/* Categoría Padre */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Jerarquía
                </h2>

                <Select
                  label="Categoría padre (opcional)"
                  options={[
                    { value: '', label: 'Sin categoría padre (categoría principal)' },
                    ...parentCategoryOptions,
                  ]}
                  value={watchedParentId || ''}
                  onChange={(value) => setValue('parentId', value || undefined)}
                  placeholder="Seleccionar categoría padre..."
                />

                {watchedParentId && watchedParentId !== category.parentId && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-400">
                      💡 Cambiará la jerarquía de esta categoría. Esto puede afectar 
                      la organización de tus reportes y filtros.
                    </p>
                  </div>
                )}

                {category.parentId && !watchedParentId && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-400">
                      ⚠️ Convertirás esta subcategoría en una categoría principal. 
                      Sus subcategorías se mantendrán como están.
                    </p>
                  </div>
                )}
              </div>

              {/* Personalización */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Personalización
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorPicker
                    label="Color"
                    value={watchedColor}
                    onChange={(color) => setValue('color', color as ValidColor)}
                    error={errors.color?.message}
                  />

                  <IconPicker
                    label="Icono"
                    value={watchedIcon}
                    onChange={(icon) => setValue('icon', icon as ValidIcon)}
                    error={errors.icon?.message}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          {/* Current vs New Preview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Vista Previa</h3>
            
            <div className="space-y-4">
              {/* Current */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Actual</label>
                <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {category.color && (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-white">{category.name}</div>
                      {category.parentId && (
                        <div className="text-sm text-gray-400">
                          Subcategoría de: {
                            categories.find(c => c.id === category.parentId)?.name || 'Categoría padre'
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* New */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nuevo</label>
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {watchedColor && (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: watchedColor }}
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {watch('name') || category.name}
                      </div>
                      {watchedParentId && (
                        <div className="text-sm text-gray-400">
                          Subcategoría de: {
                            categories.find(c => c.id === watchedParentId)?.name || 'Categoría padre'
                          }
                        </div>
                      )}
                      {!watchedParentId && category.parentId && (
                        <div className="text-sm text-purple-400">
                          Ahora es categoría principal
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Original Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Información Original</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Creada:</span>
                <span className="text-white">
                  {new Date(category.createdAt).toLocaleDateString('es-ES')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Última actualización:</span>
                <span className="text-white">
                  {new Date(category.updatedAt).toLocaleDateString('es-ES')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estado:</span>
                <span className={`${category.active ? 'text-green-400' : 'text-gray-400'}`}>
                  {category.active ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </div>
          </Card>

          {/* Hierarchy Warning */}
          {category.children && category.children.length > 0 && (
            <Card className="p-6 border-amber-500/20 bg-amber-500/5">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-400 mb-2">Subcategorías existentes</h3>
                  <p className="text-sm text-amber-300 mb-2">
                    Esta categoría tiene {category.children.length} subcategoría(s). 
                    Al cambiar su jerarquía, las subcategorías se mantendrán organizadas bajo esta.
                  </p>
                  <div className="text-xs text-amber-200">
                    {category.children.map(child => child.name).join(', ')}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}