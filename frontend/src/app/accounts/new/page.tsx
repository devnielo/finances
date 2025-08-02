'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAccountActions, useAccounts } from '@/stores/accountStore';
import { AccountType } from '@/types';
import { 
  createAccountSchema, 
  CreateAccountFormData,
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

export default function NewAccountPage() {
  const router = useRouter();
  const { createAccount } = useAccountActions();
  const { accounts } = useAccounts();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema) as Resolver<CreateAccountFormData>,
    defaultValues: {
      name: '',
      type: AccountType.ASSET,
      currency: 'EUR',
      openingBalance: 0,
      openingBalanceDate: new Date().toISOString().split('T')[0],
      notes: undefined,
    },
    mode: 'onChange',
  });

  const watchedType = watch('type');
  const watchedName = watch('name');

  // Validar nombre único
  const nameError = React.useMemo(() => {
    if (!watchedName) return undefined;
    
    const existingNames = accounts.map(account => account.name);
    const isDuplicate = existingNames.some(
      name => name.toLowerCase() === watchedName.toLowerCase()
    );
    
    return isDuplicate ? 'Ya existe una cuenta con este nombre' : undefined;
  }, [watchedName, accounts]);

  const onSubmit = async (data: CreateAccountFormData) => {
    if (nameError) return;

    setIsSubmitting(true);
    try {
      await createAccount(data);
      router.push('/accounts');
    } catch (error) {
      console.error('Error al crear cuenta:', error);
      // El error se maneja en el store y se mostraría en la UI
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getTypeDescription = (type: AccountType) => {
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

  const getBalanceHint = (type: AccountType) => {
    switch (type) {
      case AccountType.ASSET:
        return 'Ingresa el balance actual de la cuenta. Puede ser positivo o negativo.';
      case AccountType.LIABILITY:
        return 'Ingresa el monto de la deuda. Usa valores negativos para deudas.';
      case AccountType.EXPENSE:
        return 'Normalmente comienza en 0. Los gastos reducirán este balance.';
      case AccountType.REVENUE:
        return 'Normalmente comienza en 0. Los ingresos aumentarán este balance.';
      default:
        return 'Ingresa el balance inicial de la cuenta.';
    }
  };

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
            <h1 className="text-2xl font-bold text-text-primary">Nueva Cuenta</h1>
            <p className="text-text-muted">Crea una nueva cuenta financiera</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">Información Básica</h2>
              
              {/* Nombre */}
              <Input
                label="Nombre de la cuenta"
                placeholder="Ej: Cuenta Corriente Principal"
                required
                error={errors.name?.message || nameError}
                {...register('name')}
              />

              {/* Tipo de cuenta */}
              <div className="space-y-2">
                <Select
                  label="Tipo de cuenta"
                  options={accountTypeOptions}
                  value={watchedType}
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
                value={watch('currency')}
                onChange={(value) => setValue('currency', value)}
                required
                error={errors.currency?.message}
              />
            </div>
          </Card>

          <Card>
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">Balance Inicial</h2>
              
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
              disabled={!isValid || !!nameError}
            >
              Crear Cuenta
            </Button>
          </div>
        </form>

        {/* Información de ayuda */}
        <Card className="bg-accent-primary/5 border-accent-primary/20">
          <div className="space-y-3">
            <h3 className="font-medium text-accent-primary">💡 Consejos</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Usa nombres descriptivos para identificar fácilmente tus cuentas</li>
              <li>• Las cuentas de activos representan dinero que tienes</li>
              <li>• Las cuentas de pasivos representan dinero que debes</li>
              <li>• Puedes cambiar estos datos más adelante si es necesario</li>
            </ul>
          </div>
        </Card>
      </div>
    </Layout>
  );
}