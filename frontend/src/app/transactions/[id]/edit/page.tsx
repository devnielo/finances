'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useTransactionActions } from '@/stores/transactionStore';
import { useAccounts } from '@/stores/accountStore';
import { Transaction, TransactionType, AccountType } from '@/types';
import { 
  updateTransactionSchema, 
  UpdateTransactionFormData,
  getTransactionTypeName,
  getTransactionIcon,
  validateTransactionAccounts
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

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params?.id as string;
  
  const { updateTransaction, getTransactionById } = useTransactionActions();
  const { accounts } = useAccounts();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<UpdateTransactionFormData>({
    resolver: zodResolver(updateTransactionSchema),
    mode: 'onChange',
  });

  const watchedType = watch('type');
  const watchedSourceAccount = watch('sourceAccountId');
  const watchedDestinationAccount = watch('destinationAccountId');

  // Cargar datos de la transacción
  useEffect(() => {
    if (transactionId) {
      const foundTransaction = getTransactionById(transactionId);
      if (foundTransaction) {
        setTransaction(foundTransaction);
        setTags(foundTransaction.tags || []);
        
        // Llenar el formulario con los datos existentes
        reset({
          amount: foundTransaction.amount,
          description: foundTransaction.description,
          date: foundTransaction.date,
          type: foundTransaction.type,
          sourceAccountId: foundTransaction.sourceAccountId || '',
          destinationAccountId: foundTransaction.destinationAccountId || '',
          categoryId: foundTransaction.categoryId || '',
          notes: foundTransaction.notes || undefined,
        });
      }
      setIsLoading(false);
    }
  }, [transactionId, getTransactionById, reset]);

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

  const getTypeDescription = (type?: TransactionType) => {
    if (!type) return '';
    
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

  const getAmountLabel = (type?: TransactionType) => {
    if (!type) return 'Monto';
    
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

  const onSubmit = async (data: UpdateTransactionFormData) => {
    if (!transaction) return;

    // Validar cuentas según el tipo
    const accountError = validateTransactionAccounts(
      data.type!,
      data.sourceAccountId,
      data.destinationAccountId
    );
    
    if (accountError) {
      console.error(accountError);
      return;
    }

    setIsSubmitting(true);
    try {
      const transactionData = {
        ...data,
        tags,
      };
      await updateTransaction(transaction.id, transactionData);
      router.push(`/transactions/${transaction.id}`);
    } catch (error) {
      console.error('Error al actualizar transacción:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push(`/transactions/${transactionId}`);
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

  // Validar que las cuentas tengan la misma moneda en transferencias
  const currencyMismatch = watchedType === TransactionType.TRANSFER &&
    watchedSourceAccount && watchedDestinationAccount &&
    getAccountCurrency(watchedSourceAccount) !== getAccountCurrency(watchedDestinationAccount);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-surface-hover rounded mb-4"></div>
            <div className="h-96 bg-surface-hover rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!transaction) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Transacción no encontrada</h1>
          <p className="text-text-muted mb-6">La transacción que intentas editar no existe o ha sido eliminada.</p>
          <Button onClick={() => router.push('/transactions')}>Volver a Transacciones</Button>
        </div>
      </Layout>
    );
  }

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
            <div className="flex items-center space-x-2">
              <span className="text-xl">{getTransactionIcon(transaction.type)}</span>
              <h1 className="text-2xl font-bold text-text-primary">Editar Transacción</h1>
            </div>
            <p className="text-text-muted">Modifica &ldquo;{transaction.description}&rdquo;</p>
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
                      value={field.value || ''}
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
                        className="inline-flex items-center px-2 py-1 rounded-md bg-accent-primary/10 text-accent-primary text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-accent-secondary"
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
                           focus:ring-2 focus:ring-accent-primary focus:border-accent-primary
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
                           focus:ring-2 focus:ring-accent-primary focus:border-accent-primary
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
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            
            <div className="space-x-3 flex">
              {isDirty && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    reset();
                    setTags(transaction.tags || []);
                  }}
                  disabled={isSubmitting}
                >
                  Deshacer cambios
                </Button>
              )}
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={!isValid || !!currencyMismatch || !isDirty}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </form>

        {/* Información de ayuda */}
        <Card className="bg-info/5 border-info/20">
          <div className="space-y-3">
            <h3 className="font-medium text-info">ℹ️ Información importante</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Cambiar el tipo de transacción puede requerir seleccionar diferentes cuentas</li>
              <li>• Los cambios en el monto afectarán los balances de las cuentas involucradas</li>
              <li>• Cambiar las cuentas en una transferencia puede afectar múltiples balances</li>
              <li>• Las transacciones conciliadas deben editarse con cuidado</li>
            </ul>
          </div>
        </Card>
      </div>
    </Layout>
  );
}