'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Select from '@/components/ui/Select';
import { useAccountActions, useAccounts } from '@/stores/accountStore';
import { Account, AccountType } from '@/types';
import { 
  updateAccountSchema, 
  UpdateAccountFormData,
  getAccountTypeIcon,
  getAccountTypeName 
} from '@/lib/validations/account';

const accountTypeOptions = [
  { 
    value: AccountType.ASSET, 
    label: getAccountTypeName(AccountType.ASSET), 
    icon: getAccountTypeIcon(AccountType.ASSET) 
  },
  { 
    value: AccountType.LIABILITY, 
    label: getAccountTypeName(AccountType.LIABILITY), 
    icon: getAccountTypeIcon(AccountType.LIABILITY) 
  },
  { 
    value: AccountType.EXPENSE, 
    label: getAccountTypeName(AccountType.EXPENSE), 
    icon: getAccountTypeIcon(AccountType.EXPENSE) 
  },
  { 
    value: AccountType.REVENUE, 
    label: getAccountTypeName(AccountType.REVENUE), 
    icon: getAccountTypeIcon(AccountType.REVENUE) 
  },
];

const currencyOptions = [
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'USD', label: 'Dólar Estadounidense (USD)' },
  { value: 'GBP', label: 'Libra Esterlina (GBP)' },
  { value: 'JPY', label: 'Yen Japonés (JPY)' },
  { value: 'AUD', label: 'Dólar Australiano (AUD)' },
  { value: 'CAD', label: 'Dólar Canadiense (CAD)' },
  { value: 'CHF', label: 'Franco Suizo (CHF)' },
  { value: 'CNY', label: 'Yuan Chino (CNY)' },
];

export default function EditAccountPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params?.id as string;
  
  const { updateAccount, getAccountById } = useAccountActions();
  const { accounts } = useAccounts();
  const [account, setAccount] = useState<Account | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<UpdateAccountFormData>({
    resolver: zodResolver(updateAccountSchema),
    mode: 'onChange',
  });

  const watchedType = watch('type');
  const watchedName = watch('name');

  // Cargar datos de la cuenta
  useEffect(() => {
    if (accounts.length > 0 && accountId) {
      const foundAccount = getAccountById(accountId);
      if (foundAccount) {
        setAccount(foundAccount);
        
        // Llenar el formulario con los datos existentes
        reset({
          name: foundAccount.name,
          type: foundAccount.type,
          currency: foundAccount.currency,
          openingBalance: foundAccount.openingBalance,
          openingBalanceDate: foundAccount.openingBalanceDate?.split('T')[0],
          notes: foundAccount.notes || undefined,
        });
      }
      setIsLoading(false);
    }
  }, [accountId, accounts, getAccountById, reset]);

  // Validar nombre único (excluir la cuenta actual)
  const nameError = React.useMemo(() => {
    if (!watchedName || !account) return undefined;
    
    const existingNames = accounts
      .filter(acc => acc.id !== account.id)
      .map(acc => acc.name);
    
    const isDuplicate = existingNames.some(
      name => name.toLowerCase() === watchedName.toLowerCase()
    );
    
    return isDuplicate ? 'Ya existe una cuenta con este nombre' : undefined;
  }, [watchedName, accounts, account]);

  const onSubmit = async (data: UpdateAccountFormData) => {
    if (!account || nameError) return;

    setIsSubmitting(true);
    try {
      await updateAccount(account.id, data);
      router.push(`/accounts/${account.id}`);
    } catch (error) {
      console.error('Error al actualizar cuenta:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push(`/accounts/${accountId}`);
  };

  const getTypeDescription = (type?: AccountType) => {
    if (!type) return '';
    
    switch (type) {
      case AccountType.ASSET:
        return 'Cuentas que representan dinero o recursos que posees (cuentas bancarias, efectivo, inversiones).';
      case AccountType.LIABILITY:
        return 'Cuentas que representan deudas o obligaciones financieras (tarjetas de crédito, préstamos).';
      case AccountType.EXPENSE:
        return 'Categorías para registrar gastos y salidas de dinero.';
      case AccountType.REVENUE:
        return 'Categorías para registrar ingresos y entradas de dinero.';
      default:
        return '';
    }
  };

  const getBalanceHint = (type?: AccountType) => {
    if (!type) return 'Ingresa el balance de la cuenta.';
    
    switch (type) {
      case AccountType.ASSET:
        return 'Balance actual de la cuenta. Puede ser positivo o negativo.';
      case AccountType.LIABILITY:
        return 'Monto de la deuda. Usa valores negativos para deudas.';
      case AccountType.EXPENSE:
        return 'Balance acumulado de gastos.';
      case AccountType.REVENUE:
        return 'Balance acumulado de ingresos.';
      default:
        return 'Balance de la cuenta.';
    }
  };

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

  if (!account) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Cuenta no encontrada</h1>
          <p className="text-text-muted mb-6">La cuenta que intentas editar no existe o ha sido eliminada.</p>
          <Button onClick={() => router.push('/accounts')}>Volver a Cuentas</Button>
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
              <span className="text-xl">{getAccountTypeIcon(account.type)}</span>
              <h1 className="text-2xl font-bold text-text-primary">Editar Cuenta</h1>
            </div>
            <p className="text-text-muted">Modifica la información de &ldquo;{account.name}&rdquo;</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">Información Básica</h2>
              
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Nombre de la cuenta <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cuenta Corriente Principal"
                  className="w-full px-3 py-2 border border-border-primary rounded-md
                           bg-surface-primary text-text-primary
                           focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
                  {...register('name')}
                />
                {(errors.name || nameError) && (
                  <p className="mt-1 text-sm text-error">{errors.name?.message || nameError}</p>
                )}
              </div>

              {/* Tipo de cuenta */}
              <div className="space-y-2">
                <Select
                  label="Tipo de cuenta"
                  options={accountTypeOptions}
                  value={watchedType || ''}
                  onChange={(value) => setValue('type', value as AccountType)}
                  required
                  error={errors.type?.message}
                />
                <p className="text-sm text-text-muted">
                  {getTypeDescription(watchedType)}
                </p>
              </div>

              {/* Moneda */}
              <Select
                label="Moneda"
                options={currencyOptions}
                value={watch('currency') || ''}
                onChange={(value) => setValue('currency', value)}
                required
                error={errors.currency?.message}
              />
            </div>
          </Card>

          <Card>
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">Balance</h2>
              
              {/* Balance inicial */}
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Balance inicial <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-border-primary rounded-md 
                             bg-surface-primary text-text-primary
                             focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
                    {...register('openingBalance', { 
                      valueAsNumber: true 
                    })}
                  />
                  {errors.openingBalance && (
                    <p className="mt-1 text-sm text-error">{errors.openingBalance.message}</p>
                  )}
                </div>
                <p className="text-sm text-text-muted">
                  {getBalanceHint(watchedType)}
                </p>
              </div>

              {/* Fecha del balance inicial */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Fecha del balance inicial
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-border-primary rounded-md 
                           bg-surface-primary text-text-primary
                           focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
                  {...register('openingBalanceDate')}
                />
                {errors.openingBalanceDate && (
                  <p className="mt-1 text-sm text-error">{errors.openingBalanceDate.message}</p>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">Información Adicional</h2>
              
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
                  placeholder="Describe el propósito de esta cuenta o cualquier información relevante..."
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
                  onClick={() => reset()}
                  disabled={isSubmitting}
                >
                  Deshacer cambios
                </Button>
              )}
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={!isValid || !!nameError || !isDirty}
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
              <li>• Los cambios en el balance inicial afectarán el cálculo del balance actual</li>
              <li>• Cambiar el tipo de cuenta puede afectar cómo se interpretan las transacciones</li>
              <li>• Cambiar la moneda no convertirá automáticamente los valores existentes</li>
              <li>• Todos los cambios se aplicarán inmediatamente al guardar</li>
            </ul>
          </div>
        </Card>
      </div>
    </Layout>
  );
}