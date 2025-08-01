import { z } from 'zod';
import { AccountType } from '@/types';

// Schema para crear cuenta
export const createAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
    
  type: z.nativeEnum(AccountType, {
    message: 'Tipo de cuenta inválido',
  }),
  
  currency: z
    .string()
    .min(1, 'La moneda es requerida')
    .length(3, 'La moneda debe ser un código de 3 letras (ej: EUR, USD)')
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, 'Formato de moneda inválido'),
    
  openingBalance: z
    .number({
      message: 'El balance inicial es requerido',
    })
    .finite('El balance debe ser un número válido')
    .multipleOf(0.01, 'El balance debe tener máximo 2 decimales'),
    
  openingBalanceDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
    }, 'La fecha debe ser válida y no puede ser futura'),
    
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional()
    .transform((val) => val?.trim() || undefined),
});

// Schema para actualizar cuenta (todos los campos opcionales excepto el ID)
export const updateAccountSchema = createAccountSchema.partial();

// Schema para filtros de cuenta
export const accountFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.nativeEnum(AccountType).optional(),
  currency: z.string().length(3).optional(),
  active: z.boolean().optional(),
  minBalance: z.number().optional(),
  maxBalance: z.number().optional(),
  sortBy: z.enum(['name', 'balance', 'type', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Tipos inferidos
export type CreateAccountFormData = z.infer<typeof createAccountSchema>;
export type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;
export type AccountFilters = z.infer<typeof accountFiltersSchema>;

// Validaciones auxiliares
export const validateAccountName = (name: string, existingNames: string[], currentName?: string) => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return 'El nombre es requerido';
  }
  
  if (trimmedName.length < 2) {
    return 'El nombre debe tener al menos 2 caracteres';
  }
  
  if (trimmedName.length > 100) {
    return 'El nombre no puede exceder 100 caracteres';
  }
  
  // Verificar duplicados (excluir el nombre actual en caso de edición)
  const isDuplicate = existingNames.some(
    existingName => existingName.toLowerCase() === trimmedName.toLowerCase() && 
                   existingName !== currentName
  );
  
  if (isDuplicate) {
    return 'Ya existe una cuenta con este nombre';
  }
  
  return null;
};

export const validateCurrency = (currency: string) => {
  const currencyRegex = /^[A-Z]{3}$/;
  const upperCurrency = currency.toUpperCase();
  
  if (!currencyRegex.test(upperCurrency)) {
    return 'La moneda debe ser un código de 3 letras (ej: EUR, USD)';
  }
  
  // Lista de monedas comunes (opcional, se puede expandir)
  const commonCurrencies = [
    'EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'
  ];
  
  if (!commonCurrencies.includes(upperCurrency)) {
    console.warn(`Moneda ${upperCurrency} no está en la lista de monedas comunes`);
  }
  
  return null;
};

export const validateBalance = (balance: number, accountType: AccountType) => {
  if (!Number.isFinite(balance)) {
    return 'El balance debe ser un número válido';
  }
  
  // Validaciones específicas por tipo de cuenta
  switch (accountType) {
    case AccountType.ASSET:
      // Las cuentas de activos pueden tener balance negativo (sobregiro)
      break;
      
    case AccountType.LIABILITY:
      // Las cuentas de pasivos normalmente tienen balance negativo
      if (balance > 0) {
        console.warn('Las cuentas de pasivos normalmente tienen balance negativo');
      }
      break;
      
    case AccountType.EXPENSE:
      // Las cuentas de gastos normalmente tienen balance negativo
      if (balance > 0) {
        console.warn('Las cuentas de gastos normalmente tienen balance negativo');
      }
      break;
      
    case AccountType.REVENUE:
      // Las cuentas de ingresos normalmente tienen balance positivo
      if (balance < 0) {
        console.warn('Las cuentas de ingresos normalmente tienen balance positivo');
      }
      break;
  }
  
  return null;
};

// Función helper para formatear balance
export const formatAccountBalance = (balance: number, currency: string) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);
};

// Función helper para obtener el icono del tipo de cuenta
export const getAccountTypeIcon = (type: AccountType) => {
  switch (type) {
    case AccountType.ASSET:
      return '💰';
    case AccountType.LIABILITY:
      return '💳';
    case AccountType.EXPENSE:
      return '💸';
    case AccountType.REVENUE:
      return '💵';
    case AccountType.INITIAL_BALANCE:
      return '🏦';
    default:
      return '📊';
  }
};

// Función helper para obtener el nombre legible del tipo de cuenta
export const getAccountTypeName = (type: AccountType) => {
  switch (type) {
    case AccountType.ASSET:
      return 'Activo';
    case AccountType.LIABILITY:
      return 'Pasivo';
    case AccountType.EXPENSE:
      return 'Gasto';
    case AccountType.REVENUE:
      return 'Ingreso';
    case AccountType.INITIAL_BALANCE:
      return 'Balance Inicial';
    default:
      return 'Desconocido';
  }
};