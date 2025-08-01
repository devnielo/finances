import { z } from 'zod';
import { TransactionType } from '@/types';

// Schema para crear transacción
export const createTransactionSchema = z.object({
  amount: z
    .number({
      message: 'El monto es requerido',
    })
    .positive('El monto debe ser mayor a 0')
    .finite('El monto debe ser un número válido')
    .multipleOf(0.01, 'El monto debe tener máximo 2 decimales'),
    
  description: z
    .string()
    .min(1, 'La descripción es requerida')
    .min(3, 'La descripción debe tener al menos 3 caracteres')
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .trim(),
    
  date: z
    .string()
    .min(1, 'La fecha es requerida')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Fecha inválida')
    .refine((date) => {
      const parsedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Permitir hasta el final del día actual
      return parsedDate <= today;
    }, 'La fecha no puede ser futura'),
    
  type: z.nativeEnum(TransactionType, {
    message: 'Tipo de transacción inválido',
  }),
  
  sourceAccountId: z
    .string()
    .optional(),
    
  destinationAccountId: z
    .string()
    .optional(),
    
  categoryId: z
    .string()
    .optional(),
    
  notes: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional()
    .transform((val) => val?.trim() || undefined),
    
  tags: z
    .array(z.string().trim().min(1))
    .max(10, 'Máximo 10 etiquetas permitidas')
    .optional()
    .default([]),
}).refine((data) => {
  // Validar que las cuentas origen y destino sean diferentes en transferencias
  if (data.type === TransactionType.TRANSFER) {
    return data.sourceAccountId !== data.destinationAccountId;
  }
  return true;
}, {
  message: 'Las cuentas origen y destino deben ser diferentes',
  path: ['destinationAccountId'],
});

// Schema para actualizar transacción
export const updateTransactionSchema = createTransactionSchema.partial();

// Schema para filtros de transacciones
export const transactionFiltersSchema = z.object({
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.nativeEnum(TransactionType).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  reconciled: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  sortBy: z.enum(['date', 'amount', 'description', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Schema para transferencia rápida
export const quickTransferSchema = z.object({
  amount: z
    .number()
    .positive('El monto debe ser mayor a 0')
    .finite('El monto debe ser un número válido')
    .multipleOf(0.01, 'El monto debe tener máximo 2 decimales'),
    
  sourceAccountId: z
    .string()
    .min(1, 'La cuenta origen es requerida'),
    
  destinationAccountId: z
    .string()
    .min(1, 'La cuenta destino es requerida'),
    
  description: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .default('Transferencia'),
    
  date: z
    .string()
    .optional()
    .default(() => new Date().toISOString().split('T')[0]),
    
  notes: z
    .string()
    .optional(),
}).refine((data) => {
  return data.sourceAccountId !== data.destinationAccountId;
}, {
  message: 'Las cuentas origen y destino deben ser diferentes',
  path: ['destinationAccountId'],
});

// Tipos inferidos
export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionFormData = z.infer<typeof updateTransactionSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
export type QuickTransferFormData = z.infer<typeof quickTransferSchema>;

// Validaciones auxiliares
export const validateTransactionAmount = (amount: number, type: TransactionType) => {
  if (!Number.isFinite(amount)) {
    return 'El monto debe ser un número válido';
  }
  
  if (amount <= 0) {
    return 'El monto debe ser mayor a 0';
  }
  
  if (amount > 1000000) {
    return 'El monto es demasiado alto';
  }
  
  // Validar formato decimal
  const decimals = amount.toString().split('.')[1];
  if (decimals && decimals.length > 2) {
    return 'El monto debe tener máximo 2 decimales';
  }
  
  return null;
};

export const validateTransactionDate = (date: string) => {
  const parsedDate = new Date(date);
  
  if (isNaN(parsedDate.getTime())) {
    return 'Fecha inválida';
  }
  
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  if (parsedDate > today) {
    return 'La fecha no puede ser futura';
  }
  
  // Validar que no sea demasiado antigua (más de 10 años)
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  
  if (parsedDate < tenYearsAgo) {
    return 'La fecha es demasiado antigua';
  }
  
  return null;
};

export const validateTransactionAccounts = (
  type: TransactionType,
  sourceAccountId?: string,
  destinationAccountId?: string
) => {
  switch (type) {
    case TransactionType.WITHDRAWAL:
      if (!sourceAccountId) {
        return 'La cuenta origen es requerida para retiros';
      }
      break;
      
    case TransactionType.DEPOSIT:
      if (!destinationAccountId) {
        return 'La cuenta destino es requerida para depósitos';
      }
      break;
      
    case TransactionType.TRANSFER:
      if (!sourceAccountId) {
        return 'La cuenta origen es requerida para transferencias';
      }
      if (!destinationAccountId) {
        return 'La cuenta destino es requerida para transferencias';
      }
      if (sourceAccountId === destinationAccountId) {
        return 'Las cuentas origen y destino deben ser diferentes';
      }
      break;
  }
  
  return null;
};

// Función helper para formatear monto según el tipo
export const formatTransactionAmount = (amount: number, type: TransactionType, currency = 'EUR') => {
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  const absAmount = Math.abs(amount);
  const formatted = formatter.format(absAmount);
  
  switch (type) {
    case TransactionType.WITHDRAWAL:
      return `-${formatted}`;
    case TransactionType.DEPOSIT:
      return `+${formatted}`;
    case TransactionType.TRANSFER:
      return formatted;
    default:
      return formatted;
  }
};

// Función helper para obtener el color según el tipo
export const getTransactionColor = (type: TransactionType) => {
  switch (type) {
    case TransactionType.DEPOSIT:
      return 'text-success';
    case TransactionType.WITHDRAWAL:
      return 'text-error';
    case TransactionType.TRANSFER:
      return 'text-info';
    default:
      return 'text-text-primary';
  }
};

// Función helper para obtener el icono según el tipo
export const getTransactionIcon = (type: TransactionType) => {
  switch (type) {
    case TransactionType.DEPOSIT:
      return '💰';
    case TransactionType.WITHDRAWAL:
      return '💸';
    case TransactionType.TRANSFER:
      return '🔄';
    default:
      return '📊';
  }
};

// Función helper para obtener el nombre del tipo
export const getTransactionTypeName = (type: TransactionType) => {
  switch (type) {
    case TransactionType.DEPOSIT:
      return 'Depósito';
    case TransactionType.WITHDRAWAL:
      return 'Retiro';
    case TransactionType.TRANSFER:
      return 'Transferencia';
    default:
      return 'Desconocido';
  }
};

// Función para procesar etiquetas
export const processTags = (tagsString: string): string[] => {
  if (!tagsString.trim()) return [];
  
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .slice(0, 10); // Máximo 10 etiquetas
};

// Función para validar etiquetas
export const validateTags = (tags: string[]): string | null => {
  if (tags.length > 10) {
    return 'Máximo 10 etiquetas permitidas';
  }
  
  for (const tag of tags) {
    if (tag.length === 0) {
      return 'Las etiquetas no pueden estar vacías';
    }
    if (tag.length > 20) {
      return 'Las etiquetas no pueden exceder 20 caracteres';
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(tag)) {
      return 'Las etiquetas solo pueden contener letras, números, espacios, guiones y guiones bajos';
    }
  }
  
  return null;
};