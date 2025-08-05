'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, TreePine } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCategoryStore } from '@/stores/categoryStore';
import { categorySchema, CategoryFormData, validColors, ValidColor, ValidIcon } from '@/lib/validations/categories';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ColorPicker from '@/components/ui/ColorPicker';
import IconPicker from '@/components/ui/IconPicker';

export default function NewCategoryPage() {
  const router = useRouter();
  const {
    categories,
    loading,
    error,
    createCategory,
    fetchCategories,
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
    defaultValues: {
      name: '',
      icon: undefined,
      color: validColors[0], // Purple por defecto
      parentId: undefined,
    },
  });

  const watchedColor = watch('color');
  const watchedIcon = watch('icon');
  const watchedParentId = watch('parentId');

  useEffect(() => {
    fetchCategories();
    clearError();
  }, [fetchCategories, clearError]);

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      const categoryData = {
        name: data.name,
        icon: data.icon || undefined,
        color: data.color || undefined,
        parentId: data.parentId || undefined,
      };

      await createCategory(categoryData);
      
      // Redirect to categories list on success
      router.push('/categories');
    } catch (error) {
      console.error('Error creating category:', error);
      // Error is handled by the store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Get parent category options
  const parentCategoryOptions = categories
    .filter(cat => cat.active) // Solo categorías activas
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
          href="/categories"
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Nueva Categoría</h1>
          <p className="text-gray-400 mt-1">
            Crea una nueva categoría para organizar tus transacciones
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

                {watchedParentId && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-400">
                      💡 Esta será una subcategoría. Las subcategorías ayudan a organizar 
                      mejor tus gastos dentro de categorías más amplias.
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
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Crear Categoría
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Vista Previa</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {watchedColor && (
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: watchedColor }}
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {watch('name') || 'Nombre de la categoría'}
                    </div>
                    {watchedParentId && (
                      <div className="text-sm text-gray-400">
                        Subcategoría de: {
                          categories.find(c => c.id === watchedParentId)?.name || 'Categoría padre'
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                <p>Así se verá tu categoría en la aplicación.</p>
              </div>
            </div>
          </Card>

          {/* Tips */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              💡 Consejos
            </h3>
            
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start space-x-2">
                <TreePine className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-300">Organización jerárquica</p>
                  <p>Usa categorías padre para grupos amplios (ej: &quot;Gastos del hogar&quot;) y subcategorías para detalles específicos (ej: &quot;Servicios públicos&quot;).</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 mt-0.5 bg-purple-500 rounded-full flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-300">Colores distintivos</p>
                  <p>Elige colores que te ayuden a identificar rápidamente tus categorías en gráficos y reportes.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0">📋</div>
                <div>
                  <p className="font-medium text-gray-300">Nombres claros</p>
                  <p>Usa nombres descriptivos y consistentes que sean fáciles de recordar y encontrar.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          {categories.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                📊 Estadísticas
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total de categorías:</span>
                  <span className="text-white font-medium">{categories.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Categorías principales:</span>
                  <span className="text-white font-medium">
                    {categories.filter(c => !c.parentId).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Subcategorías:</span>
                  <span className="text-white font-medium">
                    {categories.filter(c => c.parentId).length}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}