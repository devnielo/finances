import { z } from 'zod';
import { TransactionType } from '@/types';

// Esquema para crear/editar transacciones
export const transactionSchema = z.object({
  amount: z
    .number()
    .min(0.01, 'El monto debe ser mayor a 0')
    .max(999999999.99, 'El monto es demasiado grande'),
  description: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(255, 'La descripción no puede exceder 255 caracteres'),
  date: z
    .string()
    .min(1, 'La fecha es requerida')
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida'),
  type: z.nativeEnum(TransactionType, {
    message: 'Tipo de transacción inválido',
  }),
  sourceAccountId: z
    .string()
    .uuid('ID de cuenta origen inválido')
    .optional(),
  destinationAccountId: z
    .string()
    .uuid('ID de cuenta destino inválido')
    .optional(),
  categoryId: z
    .string()
    .uuid('ID de categoría inválido')
    .optional(),
  notes: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional(),
  tags: z
    .array(z.string().min(1, 'Tag no puede estar vacío'))
    .optional(),
}).refine((data) => {
  // Validaciones específicas por tipo de transacción
  if (data.type === TransactionType.WITHDRAWAL) {
    return data.sourceAccountId && !data.destinationAccountId;
  }
  if (data.type === TransactionType.DEPOSIT) {
    return !data.sourceAccountId && data.destinationAccountId;
  }
  if (data.type === TransactionType.TRANSFER) {
    return data.sourceAccountId && data.destinationAccountId && 
           data.sourceAccountId !== data.destinationAccountId;
  }
  return true;
}, {
  message: 'Configuración de cuentas inválida para el tipo de transacción',
  path: ['type'],
});

// Esquema para split transactions
export const splitTransactionSchema = z.object({
  amount: z
    .number()
    .min(0.01, 'El monto debe ser mayor a 0')
    .max(999999999.99, 'El monto es demasiado grande'),
  description: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(255, 'La descripción no puede exceder 255 caracteres'),
  categoryId: z
    .string()
    .uuid('ID de categoría inválido')
    .optional(),
  destinationAccountId: z
    .string()
    .uuid('ID de cuenta destino inválido')
    .optional(),
});

// Esquema para múltiples split transactions
export const multipleSplitTransactionSchema = z.object({
  sourceAccountId: z
    .string()
    .min(1, 'La cuenta origen es requerida')
    .uuid('ID de cuenta origen inválido'),
  date: z
    .string()
    .min(1, 'La fecha es requerida')
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida'),
  splits: z
    .array(splitTransactionSchema)
    .min(2, 'Se requieren al menos 2 divisiones')
    .max(20, 'No se pueden tener más de 20 divisiones'),
  notes: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional(),
}).refine((data) => {
  // Validar que la suma de splits sea mayor a 0
  const totalAmount = data.splits.reduce((sum, split) => sum + split.amount, 0);
  return totalAmount > 0;
}, {
  message: 'La suma total de las divisiones debe ser mayor a 0',
  path: ['splits'],
});

// Esquema para filtros de transacciones
export const transactionFiltersSchema = z.object({
  startDate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), 'Fecha de inicio inválida'),
  endDate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), 'Fecha de fin inválida'),
  accountId: z
    .string()
    .uuid('ID de cuenta inválido')
    .optional(),
  categoryId: z
    .string()
    .uuid('ID de categoría inválido')
    .optional(),
  type: z
    .nativeEnum(TransactionType)
    .optional(),
  search: z
    .string()
    .max(255, 'Búsqueda no puede exceder 255 caracteres')
    .optional(),
  page: z
    .number()
    .int()
    .min(1, 'La página debe ser mayor a 0')
    .optional(),
  limit: z
    .number()
    .int()
    .min(1, 'El límite debe ser mayor a 0')
    .max(100, 'El límite no puede exceder 100')
    .optional(),
}).refine((data) => {
  // Validar que la fecha de inicio sea anterior a la fecha de fin
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['endDate'],
});

// Esquema para importar transacciones
export const importTransactionSchema = z.object({
  file: z
    .instanceof(File, { message: 'Archivo requerido' })
    .refine((file) => file.size <= 5 * 1024 * 1024, 'El archivo no puede exceder 5MB')
    .refine(
      (file) => ['text/csv', 'application/vnd.ms-excel'].includes(file.type),
      'Solo se permiten archivos CSV'
    ),
  accountId: z
    .string()
    .min(1, 'La cuenta es requerida')
    .uuid('ID de cuenta inválido'),
  dateFormat: z
    .string()
    .min(1, 'El formato de fecha es requerido'),
  skipHeader: z
    .boolean()
    .default(true),
});

// Tipos inferidos
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type SplitTransactionFormData = z.infer<typeof splitTransactionSchema>;
export type MultipleSplitTransactionFormData = z.infer<typeof multipleSplitTransactionSchema>;
export type TransactionFiltersFormData = z.infer<typeof transactionFiltersSchema>;
export type ImportTransactionFormData = z.infer<typeof importTransactionSchema>;