import { z } from 'zod';
import { AccountType } from '@/types';

// Esquema para crear/editar cuentas
export const accountSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  type: z.nativeEnum(AccountType, {
    message: 'Tipo de cuenta inválido',
  }),
  currency: z
    .string()
    .min(1, 'La moneda es requerida')
    .length(3, 'La moneda debe tener 3 caracteres')
    .regex(/^[A-Z]{3}$/, 'Formato de moneda inválido (ej: EUR, USD)')
    .default('EUR'),
  openingBalance: z
    .number()
    .min(-999999999.99, 'El balance es demasiado pequeño')
    .max(999999999.99, 'El balance es demasiado grande')
    .default(0),
  openingBalanceDate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), 'Fecha inválida'),
  notes: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional(),
});

// Esquema para filtros de cuentas
export const accountFiltersSchema = z.object({
  type: z
    .nativeEnum(AccountType)
    .optional(),
  active: z
    .boolean()
    .optional(),
  search: z
    .string()
    .max(255, 'Búsqueda no puede exceder 255 caracteres')
    .optional(),
  currency: z
    .string()
    .length(3, 'La moneda debe tener 3 caracteres')
    .regex(/^[A-Z]{3}$/, 'Formato de moneda inválido')
    .optional(),
});

// Esquema para transferencia entre cuentas
export const transferSchema = z.object({
  fromAccountId: z
    .string()
    .min(1, 'La cuenta origen es requerida')
    .uuid('ID de cuenta origen inválido'),
  toAccountId: z
    .string()
    .min(1, 'La cuenta destino es requerida')
    .uuid('ID de cuenta destino inválido'),
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
  notes: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional(),
}).refine((data) => data.fromAccountId !== data.toAccountId, {
  message: 'Las cuentas origen y destino deben ser diferentes',
  path: ['toAccountId'],
});

// Esquema para reconciliación de cuentas
export const reconciliationSchema = z.object({
  accountId: z
    .string()
    .min(1, 'La cuenta es requerida')
    .uuid('ID de cuenta inválido'),
  startDate: z
    .string()
    .min(1, 'La fecha de inicio es requerida')
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha de inicio inválida'),
  endDate: z
    .string()
    .min(1, 'La fecha de fin es requerida')
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha de fin inválida'),
  endingBalance: z
    .number()
    .min(-999999999.99, 'El balance es demasiado pequeño')
    .max(999999999.99, 'El balance es demasiado grande'),
}).refine((data) => {
  return new Date(data.startDate) <= new Date(data.endDate);
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin',
  path: ['endDate'],
});

// Tipos inferidos
export type AccountFormData = z.infer<typeof accountSchema>;
export type AccountFiltersFormData = z.infer<typeof accountFiltersSchema>;
export type TransferFormData = z.infer<typeof transferSchema>;
export type ReconciliationFormData = z.infer<typeof reconciliationSchema>;