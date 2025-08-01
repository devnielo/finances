import { z } from 'zod';

// Lista de iconos válidos (usando Lucide React icons)
const validIcons = [
  'Home', 'Car', 'ShoppingCart', 'Coffee', 'Utensils', 'Gamepad2',
  'Music', 'Book', 'Plane', 'Heart', 'Gift', 'Shirt', 'Smartphone',
  'Laptop', 'CreditCard', 'PiggyBank', 'TrendingUp', 'TrendingDown',
  'DollarSign', 'Euro', 'Building', 'Fuel', 'ShoppingBag', 'Pizza',
  'Bus', 'Train', 'Bike', 'Wallet', 'Receipt', 'Calculator',
  'Briefcase', 'GraduationCap', 'Stethoscope', 'Dumbbell', 'Users',
  'Baby', 'Dog', 'Cat', 'Trees', 'Lightbulb', 'Wrench', 'Palette',
  'Camera', 'Monitor', 'Headphones', 'Calendar', 'MapPin', 'Star',
] as const;

// Lista de colores válidos
const validColors = [
  '#8b5cf6', '#a855f7', '#c084fc', '#7c3aed', '#d8b4fe',
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#374151',
] as const;

// Esquema para crear/editar categorías
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  icon: z
    .enum(validIcons, {
      message: 'Icono inválido',
    })
    .optional(),
  color: z
    .enum(validColors, {
      message: 'Color inválido',
    })
    .optional(),
  parentId: z
    .string()
    .uuid('ID de categoría padre inválido')
    .optional(),
});

// Esquema para filtros de categorías
export const categoryFiltersSchema = z.object({
  search: z
    .string()
    .max(255, 'Búsqueda no puede exceder 255 caracteres')
    .optional(),
  parentId: z
    .string()
    .uuid('ID de categoría padre inválido')
    .optional(),
  hasParent: z
    .boolean()
    .optional(),
});

// Esquema para mover categoría
export const moveCategorySchema = z.object({
  categoryId: z
    .string()
    .min(1, 'La categoría es requerida')
    .uuid('ID de categoría inválido'),
  newParentId: z
    .string()
    .uuid('ID de nueva categoría padre inválido')
    .optional(),
}).refine((data) => {
  // Una categoría no puede ser padre de sí misma
  return data.categoryId !== data.newParentId;
}, {
  message: 'Una categoría no puede ser padre de sí misma',
  path: ['newParentId'],
});

// Esquema para ordenar categorías
export const sortCategoriesSchema = z.object({
  categories: z
    .array(
      z.object({
        id: z.string().uuid('ID de categoría inválido'),
        order: z.number().int().min(0, 'El orden debe ser mayor o igual a 0'),
      })
    )
    .min(1, 'Se requiere al menos una categoría para ordenar'),
});

// Esquema para estadísticas de categorías
export const categoryStatsSchema = z.object({
  startDate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), 'Fecha de inicio inválida'),
  endDate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), 'Fecha de fin inválida'),
  includeSubcategories: z
    .boolean()
    .default(true),
  type: z
    .enum(['expenses', 'income', 'both'], {
      message: 'Tipo de estadística inválido',
    })
    .default('both'),
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

// Esquema para importar categorías
export const importCategoriesSchema = z.object({
  file: z
    .instanceof(File, { message: 'Archivo requerido' })
    .refine((file) => file.size <= 1 * 1024 * 1024, 'El archivo no puede exceder 1MB')
    .refine(
      (file) => ['text/csv', 'application/json'].includes(file.type),
      'Solo se permiten archivos CSV o JSON'
    ),
  replaceExisting: z
    .boolean()
    .default(false),
  skipDuplicates: z
    .boolean()
    .default(true),
});

// Esquema para configuración de categoría
export const categoryConfigSchema = z.object({
  showInReports: z
    .boolean()
    .default(true),
  budgetAmount: z
    .number()
    .min(0, 'El monto del presupuesto debe ser mayor o igual a 0')
    .max(999999999.99, 'El monto del presupuesto es demasiado grande')
    .optional(),
  alertThreshold: z
    .number()
    .min(0, 'El umbral de alerta debe ser entre 0 y 100')
    .max(100, 'El umbral de alerta debe ser entre 0 y 100')
    .optional(),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
});

// Tipos inferidos
export type CategoryFormData = z.infer<typeof categorySchema>;
export type CategoryFiltersFormData = z.infer<typeof categoryFiltersSchema>;
export type MoveCategoryFormData = z.infer<typeof moveCategorySchema>;
export type SortCategoriesFormData = z.infer<typeof sortCategoriesSchema>;
export type CategoryStatsFormData = z.infer<typeof categoryStatsSchema>;
export type ImportCategoriesFormData = z.infer<typeof importCategoriesSchema>;
export type CategoryConfigFormData = z.infer<typeof categoryConfigSchema>;

// Exportar listas de iconos y colores válidos
export { validIcons, validColors };
export type ValidIcon = typeof validIcons[number];
export type ValidColor = typeof validColors[number];