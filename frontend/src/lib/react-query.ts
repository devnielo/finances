import { QueryClient } from '@tanstack/react-query';

// Configuración del cliente de React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo de vida de los datos en caché (5 minutos)
      staleTime: 5 * 60 * 1000,
      // Tiempo antes de que se eliminen los datos no utilizados (10 minutos)
      gcTime: 10 * 60 * 1000,
      // Reintentar automáticamente en caso de fallo
      retry: (failureCount: number, error: Error) => {
        // No reintentar en errores 4xx (errores del cliente)
        if ('statusCode' in error && typeof error.statusCode === 'number') {
          if (error.statusCode >= 400 && error.statusCode < 500) {
            return false;
          }
        }
        // Reintentar hasta 3 veces para otros errores
        return failureCount < 3;
      },
      // Intervalo de reintento (exponencial)
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch automático cuando la ventana recibe foco
      refetchOnWindowFocus: false,
      // Refetch automático cuando se reconecta
      refetchOnReconnect: true,
    },
    mutations: {
      // Reintentar mutaciones fallidas
      retry: (failureCount: number, error: Error) => {
        // No reintentar en errores 4xx
        if ('statusCode' in error && typeof error.statusCode === 'number') {
          if (error.statusCode >= 400 && error.statusCode < 500) {
            return false;
          }
        }
        // Reintentar hasta 2 veces para otros errores
        return failureCount < 2;
      },
    },
  },
});

// Keys de consulta para mantener consistencia
export const queryKeys = {
  // Auth
  auth: {
    me: ['auth', 'me'] as const,
    user: (id: string) => ['auth', 'user', id] as const,
  },
  
  // Accounts
  accounts: {
    all: ['accounts'] as const,
    lists: () => [...queryKeys.accounts.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.accounts.lists(), filters] as const,
    details: () => [...queryKeys.accounts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.accounts.details(), id] as const,
    balance: (id: string) => [...queryKeys.accounts.detail(id), 'balance'] as const,
    transactions: (id: string, filters?: Record<string, unknown>) => 
      [...queryKeys.accounts.detail(id), 'transactions', filters] as const,
  },
  
  // Transactions
  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.transactions.lists(), filters] as const,
    details: () => [...queryKeys.transactions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
    recent: (limit?: number) => ['transactions', 'recent', limit] as const,
  },
  
  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.categories.lists(), filters] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
    tree: () => ['categories', 'tree'] as const,
    stats: (params?: Record<string, unknown>) => ['categories', 'stats', params] as const,
  },
  
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    metrics: (period?: string) => [...queryKeys.dashboard.all, 'metrics', period] as const,
    charts: (type: string, period?: string) => 
      [...queryKeys.dashboard.all, 'charts', type, period] as const,
    trends: (period?: string) => [...queryKeys.dashboard.all, 'trends', period] as const,
  },
  
  // Reports
  reports: {
    all: ['reports'] as const,
    expense: (params?: Record<string, unknown>) => [...queryKeys.reports.all, 'expense', params] as const,
    income: (params?: Record<string, unknown>) => [...queryKeys.reports.all, 'income', params] as const,
    balance: (params?: Record<string, unknown>) => [...queryKeys.reports.all, 'balance', params] as const,
    category: (params?: Record<string, unknown>) => [...queryKeys.reports.all, 'category', params] as const,
  },
} as const;

// Funciones de invalidación para invalidar cachés relacionados
export const invalidateQueries = {
  // Invalidar todas las consultas de autenticación
  auth: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.me }),
  
  // Invalidar todas las consultas de cuentas
  accounts: () => queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all }),
  
  // Invalidar cuenta específica
  account: (id: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.accounts.detail(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.accounts.lists() });
  },
  
  // Invalidar todas las consultas de transacciones
  transactions: () => queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all }),
  
  // Invalidar transacción específica
  transaction: (id: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions.detail(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions.lists() });
  },
  
  // Invalidar todas las consultas de categorías
  categories: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
  
  // Invalidar categoría específica
  category: (id: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.detail(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.tree() });
  },
  
  // Invalidar dashboard
  dashboard: () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
  
  // Invalidar reportes
  reports: () => queryClient.invalidateQueries({ queryKey: queryKeys.reports.all }),
  
  // Invalidar todo (usar con precaución)
  all: () => queryClient.invalidateQueries(),
};

// Funciones de prefetch para precargar datos
export const prefetchQueries = {
  // Precargar datos del usuario
  user: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.auth.me,
      queryFn: () => Promise.resolve(null), // Esta función se definirá en los hooks específicos
      staleTime: 5 * 60 * 1000,
    });
  },
  
  // Precargar cuentas
  accounts: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.accounts.lists(),
      queryFn: () => Promise.resolve([]), // Esta función se definirá en los hooks específicos
      staleTime: 2 * 60 * 1000,
    });
  },
  
  // Precargar categorías
  categories: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.categories.tree(),
      queryFn: () => Promise.resolve([]), // Esta función se definirá en los hooks específicos
      staleTime: 5 * 60 * 1000,
    });
  },
  
  // Precargar dashboard
  dashboard: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.metrics(),
      queryFn: () => Promise.resolve({}), // Esta función se definirá en los hooks específicos
      staleTime: 1 * 60 * 1000,
    });
  },
};

// Función para limpiar caché específico
export const clearCache = {
  // Limpiar todo el caché
  all: () => queryClient.clear(),
  
  // Limpiar caché de autenticación
  auth: () => queryClient.removeQueries({ queryKey: queryKeys.auth.me }),
  
  // Limpiar caché de cuentas
  accounts: () => queryClient.removeQueries({ queryKey: queryKeys.accounts.all }),
  
  // Limpiar caché de transacciones
  transactions: () => queryClient.removeQueries({ queryKey: queryKeys.transactions.all }),
  
  // Limpiar caché de categorías
  categories: () => queryClient.removeQueries({ queryKey: queryKeys.categories.all }),
  
  // Limpiar caché de dashboard
  dashboard: () => queryClient.removeQueries({ queryKey: queryKeys.dashboard.all }),
};

export default queryClient;