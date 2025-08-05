'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactionActions } from '@/stores/transactionStore';
import { useAccounts } from '@/stores/accountStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { TransactionType, AccountType } from '@/types';
import { 
  createTransactionSchema, 
  CreateTransactionFormData,
  getTransactionTypeName,
  getTransactionIcon,
  validateTransactionAccounts,
  processTags
} from '@/lib/validations/transaction';

const transactionTypeOptions = [
  { 
    value: TransactionType.DEPOSIT, 
    label: getTransactionTypeName(TransactionType.DEPOSIT), 
    icon: getTransactionIcon(TransactionType.DEPOSIT) 
  },
  { 
    value: TransactionType.WITHDRAWAL, 
    label: getTransactionTypeName(TransactionType.WITHDRAWAL), 
    icon: getTransactionIcon(TransactionType.WITHDRAWAL) 
  },
  { 
    value: TransactionType.TRANSFER, 
    label: getTransactionTypeName(TransactionType.TRANSFER), 
    icon: getTransactionIcon(TransactionType.TRANSFER) 
  },
];

function NewTransactionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createTransaction } = useTransactionActions();
  const { accounts } = useAccounts();
  const { categories, fetchCategories } = useCategoryStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<CreateTransactionFormData>({
    resolver: zodResolver(createTransactionSchema) as Resolver<CreateTransactionFormData>,
    defaultValues: {
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: TransactionType.WITHDRAWAL,
      sourceAccountId: '',
      destinationAccountId: '',
      categoryId: '',
      notes: undefined,
      tags: [],
    },
    mode: 'onChange',
  });

  const watchedType = watch('type');
  const watchedSourceAccount = watch('sourceAccountId');
  const watchedDestinationAccount = watch('destinationAccountId');

  // Pre-seleccionar cuenta si viene del URL
  useEffect(() => {
    const accountFromUrl = searchParams?.get('account');
    if (accountFromUrl && accounts.length > 0) {
      const account = accounts.find(acc => acc.id === accountFromUrl);
      if (account) {
        setValue('sourceAccountId', accountFromUrl);
      }
    }
  }, [searchParams, accounts, setValue]);

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filtrar cuentas según el tipo de transacción
  const getAccountOptions = (forDestination = false) => {
    let filteredAccounts = accounts.filter(account => account.active);
    
    if (watchedType === TransactionType.DEPOSIT && forDestination) {
      // Para depósitos, solo cuentas de activos pueden recibir dinero
      filteredAccounts = filteredAccounts.filter(account => 
        account.type === AccountType.ASSET
      );
    } else if (watchedType === TransactionType.WITHDRAWAL && !forDestination) {
      // Para retiros, solo cuentas de activos pueden dar dinero
      filteredAccounts = filteredAccounts.filter(account => 
        account.type === AccountType.ASSET
      );
    }

    return [
      { value: '', label: 'Seleccionar cuenta' },
      ...filteredAccounts.map(account => ({
        value: account.id,
        label: `${account.name} (${account.balance.toFixed(2)} ${account.currency})`,
      })),
    ];
  };

  const sourceAccountOptions = getAccountOptions(false);
  const destinationAccountOptions = getAccountOptions(true);

  const getTypeDescription = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return 'Registra dinero que entra a una cuenta (ingresos, transferencias recibidas).';
      case TransactionType.WITHDRAWAL:
        return 'Registra dinero que sale de una cuenta (gastos, pagos).';
      case TransactionType.TRANSFER:
        return 'Mueve dinero entre dos cuentas propias.';
      default:
        return '';
    }
  };

  const getAmountLabel = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return 'Monto a ingresar';
      case TransactionType.WITHDRAWAL:
        return 'Monto a retirar';
      case TransactionType.TRANSFER:
        return 'Monto a transferir';
      default:
        return 'Monto';
    }
  };

  const onSubmit = async (data: CreateTransactionFormData) => {
    // Validar cuentas según el tipo
    const accountError = validateTransactionAccounts(
      data.type,
      data.sourceAccountId,
      data.destinationAccountId
    );
    
    if (accountError) {
      // Aquí podrías mostrar el error de alguna manera
      console.error(accountError);
      return;
    }

    setIsSubmitting(true);
    try {
      const transactionData = {
        ...data,
        tags,
      };
      await createTransaction(transactionData);
      router.push('/transactions');
    } catch (error) {
      console.error('Error al crear transacción:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag) && tags.length < 10) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const getAccountCurrency = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account?.currency || 'EUR';
  };

  // Preparar opciones de categorías para el select
  const getCategoryOptions = () => {
    const activeCategories = categories.filter(cat => cat.active);
    
    // Crear opciones jerárquicas
    const buildCategoryTree = (parentId: string | null = null, level: number = 0): Array<{value: string; label: string; icon?: React.ReactNode}> => {
      const children = activeCategories.filter(cat => cat.parentId === parentId);
      const options: Array<{value: string; label: string; icon?: React.ReactNode}> = [];
      
      children.forEach(category => {
        const indent = '  '.repeat(level);
        options.push({
          value: category.id,
          label: `${indent}${category.name}`,
          icon: category.color ? (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category.color }}
            />
          ) : undefined,
        });
        
        // Añadir subcategorías
        options.push(...buildCategoryTree(category.id, level + 1));
      });
      
      return options;
    };

    return [
      { value: '', label: 'Sin categoría' },
      ...buildCategoryTree(),
    ];
  };

  const categoryOptions = getCategoryOptions();

  // Validar que las cuentas tengan la misma moneda en transferencias
  const currencyMismatch = watchedType === TransactionType.TRANSFER &&
    watchedSourceAccount && watchedDestinationAccount &&
    getAccountCurrency(watchedSourceAccount) !== getAccountCurrency(watchedDestinationAccount);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Nueva Transacción</h1>
            <p className="text-text-muted">Registra un nuevo movimiento financiero</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">Información Básica</h2>
              
              {/* Tipo de transacción */}
              <div className="space-y-2">
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Tipo de transacción"
                      options={transactionTypeOptions}
                      value={field.value}
                      onChange={field.onChange}
                      required
                      error={errors.type?.message}
                    />
                  )}
                />
                <p className="text-sm text-text-muted">
                  {getTypeDescription(watchedType)}
                </p>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Descripción <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Compra en supermercado, Pago de alquiler..."
                  className="w-full px-3 py-2 border border-border-primary rounded-md 
                           bg-surface-primary text-text-primary
                           focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-error">{errors.description.message}</p>
                )}
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  {getAmountLabel(watchedType)} <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-border-primary rounded-md 
                           bg-surface-primary text-text-primary
                           focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
                  {...register('amount', { valueAsNumber: true })}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-error">{errors.amount.message}</p>
                )}
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Fecha <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-border-primary rounded-md 
                           bg-surface-primary text-text-primary
                           focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
                  {...register('date')}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-error">{errors.date.message}</p>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">Cuentas</h2>
              
              {/* Cuenta origen (para retiros y transferencias) */}
              {(watchedType === TransactionType.WITHDRAWAL || watchedType === TransactionType.TRANSFER) && (
                <Controller
                  name="sourceAccountId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Cuenta origen"
                      options={sourceAccountOptions}
                      value={field.value || ''}
                      onChange={field.onChange}
                      required
                      error={errors.sourceAccountId?.message}
                    />
                  )}
                />
              )}

              {/* Cuenta destino (para depósitos y transferencias) */}
              {(watchedType === TransactionType.DEPOSIT || watchedType === TransactionType.TRANSFER) && (
                <Controller
                  name="destinationAccountId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Cuenta destino"
                      options={destinationAccountOptions}
                      value={field.value || ''}
                      onChange={field.onChange}
                      required
                      error={errors.destinationAccountId?.message}
                    />
                  )}
                />
              )}

              {/* Advertencia de monedas diferentes */}
              {currencyMismatch && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
                  <p className="text-sm text-warning">
                    ⚠️ Las cuentas seleccionadas usan diferentes monedas. 
                    La transferencia se registrará con el monto especificado en ambas cuentas.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Categorización */}
          <Card>
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">Categorización</h2>
              
              {/* Selector de categoría */}
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Categoría"
                    options={categoryOptions}
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={errors.categoryId?.message}
                    placeholder="Selecciona una categoría..."
                  />
                )}
              />
              
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                <p className="text-sm text-blue-400">
                  💡 Las categorías te ayudan a organizar y analizar tus gastos e ingresos.
                  Puedes crear nuevas categorías desde el menú de Categorías.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">Información Adicional</h2>
              
              {/* Etiquetas */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Etiquetas <span className="text-text-muted">(opcional)</span>
                </label>
                
                {/* Etiquetas existentes */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-600 text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-blue-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <input
                  type="text"
                  placeholder="Escribe una etiqueta y presiona Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  disabled={tags.length >= 10}
                  className="w-full px-3 py-2 border border-border-primary rounded-md 
                           bg-surface-primary text-text-primary
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           disabled:opacity-50"
                />
                <p className="text-xs text-text-muted">
                  Presiona Enter o coma para añadir etiquetas. Máximo 10 etiquetas.
                </p>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Notas <span className="text-text-muted">(opcional)</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-border-primary rounded-md 
                           bg-surface-primary text-text-primary
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           resize-vertical min-h-[100px]"
                  placeholder="Información adicional sobre esta transacción..."
                  {...register('notes')}
                />
                {errors.notes && (
                  <p className="text-sm text-error">{errors.notes.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={!isValid || !!currencyMismatch}
            >
              Crear Transacción
            </Button>
          </div>
        </form>

        {/* Información de ayuda */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="space-y-3">
            <h3 className="font-medium text-blue-600">💡 Consejos</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• <strong>Depósitos</strong>: Para registrar ingresos o dinero que entra</li>
              <li>• <strong>Retiros</strong>: Para registrar gastos o dinero que sale</li>
              <li>• <strong>Transferencias</strong>: Para mover dinero entre tus propias cuentas</li>
              <li>• Las etiquetas te ayudan a categorizar y buscar transacciones</li>
              <li>• Puedes editar estos datos más adelante si es necesario</li>
            </ul>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

// Wrapper con Suspense para useSearchParams
function NewTransactionPageWrapper() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <NewTransactionPage />
    </Suspense>
  );
}

export default NewTransactionPageWrapper;