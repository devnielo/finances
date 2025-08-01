import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases CSS usando clsx y tailwind-merge
 * para evitar conflictos entre clases de Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como moneda
 */
export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  locale: string = 'es-ES'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea un número de forma compacta (1K, 1M, etc.)
 */
export function formatCompactNumber(
  num: number,
  locale: string = 'es-ES'
): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

/**
 * Formatea una fecha
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  locale: string = 'es-ES'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Formatea una fecha de forma relativa (hace 2 días, etc.)
 */
export function formatRelativeDate(
  date: string | Date,
  locale: string = 'es-ES'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  const now = new Date();
  const diffInMs = dateObj.getTime() - now.getTime();
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
  
  if (Math.abs(diffInDays) < 1) {
    const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
    if (Math.abs(diffInHours) < 1) {
      const diffInMinutes = Math.round(diffInMs / (1000 * 60));
      return rtf.format(diffInMinutes, 'minute');
    }
    return rtf.format(diffInHours, 'hour');
  }
  
  if (Math.abs(diffInDays) < 7) {
    return rtf.format(diffInDays, 'day');
  }
  
  if (Math.abs(diffInDays) < 30) {
    const diffInWeeks = Math.round(diffInDays / 7);
    return rtf.format(diffInWeeks, 'week');
  }
  
  const diffInMonths = Math.round(diffInDays / 30);
  return rtf.format(diffInMonths, 'month');
}

/**
 * Capitaliza la primera letra de un string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convierte un string a slug (URL-friendly)
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remueve acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remueve caracteres especiales
    .trim()
    .replace(/\s+/g, '-') // Reemplaza espacios con guiones
    .replace(/-+/g, '-'); // Remueve guiones duplicados
}

/**
 * Trunca un texto a un número específico de caracteres
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Valida si un email es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Genera un ID único
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Retrasa la ejecución por un tiempo específico
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function para evitar llamadas excesivas
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function para limitar la frecuencia de llamadas
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Copia texto al portapapeles
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) {
    // Fallback para navegadores más antiguos
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Obtiene el color basado en el tipo de transacción
 */
export function getTransactionColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'deposit':
    case 'income':
      return 'text-success';
    case 'withdrawal':
    case 'expense':
      return 'text-error';
    case 'transfer':
      return 'text-info';
    default:
      return 'text-text-secondary';
  }
}

/**
 * Obtiene el ícono basado en el tipo de cuenta
 */
export function getAccountTypeIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'asset':
      return 'Wallet';
    case 'expense':
      return 'ShoppingCart';
    case 'revenue':
      return 'TrendingUp';
    case 'liability':
      return 'CreditCard';
    default:
      return 'DollarSign';
  }
}

/**
 * Valida si una fecha está en el rango permitido
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
}

/**
 * Calcula el porcentaje de cambio entre dos valores
 */
export function calculatePercentageChange(
  oldValue: number,
  newValue: number
): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Formatea el porcentaje de cambio con color
 */
export function formatPercentageChange(percentage: number): {
  value: string;
  color: string;
  isPositive: boolean;
} {
  const isPositive = percentage >= 0;
  const color = isPositive ? 'text-success' : 'text-error';
  const value = `${isPositive ? '+' : ''}${percentage.toFixed(1)}%`;
  
  return { value, color, isPositive };
}

/**
 * Genera colores para gráficos
 */
export function generateChartColors(count: number): string[] {
  const baseColors = [
    '#8b5cf6', // purple-500
    '#a855f7', // purple-600
    '#c084fc', // purple-400
    '#7c3aed', // purple-700
    '#d8b4fe', // purple-300
    '#6b21a8', // purple-800
    '#e9d5ff', // purple-200
    '#581c87', // purple-900
  ];
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // Generar colores adicionales si se necesitan más
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.5) % 360; // Golden angle approximation
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  
  return colors;
}

/**
 * Parsea y valida un número de input
 */
export function parseNumber(value: string): number | null {
  const cleaned = value.replace(/[^\d.,\-]/g, '');
  const normalized = cleaned.replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
}