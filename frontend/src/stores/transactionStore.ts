import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMemo } from 'react';
import { Transaction, CreateTransactionData, TransactionType, TransactionFilters, PaginatedResponse } from '@/types';
import { apiClient } from '@/lib/api/client';

// Datos mock para desarrollo
const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: -45.50,
    description: 'Supermercado Central',
    date: '2024-01-15',
    type: TransactionType.WITHDRAWAL,
    sourceAccountId: '1',
    categoryId: 'cat1',
    notes: 'Compras semanales',
    tags: ['alimentación', 'supermercado'],
    reconciled: false,
    userId: 'user1',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    amount: 1200.00,
    description: 'Salario enero',
    date: '2024-01-01',
    type: TransactionType.DEPOSIT,
    destinationAccountId: '1',
    categoryId: 'cat2',
    notes: 'Salario mensual',
    tags: ['salario', 'trabajo'],
    reconciled: true,
    userId: 'user1',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z',
  },
  {
    id: '3',
    amount: -125.00,
    description: 'Pago tarjeta crédito',
    date: '2024-01-14',
    type: TransactionType.TRANSFER,
    sourceAccountId: '1',
    destinationAccountId: '3',
    notes: 'Pago mensual tarjeta',
    tags: ['pago', 'tarjeta'],
    reconciled: false,
    userId: 'user1',
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-14T15:45:00Z',
  },
  {
    id: '4',
    amount: -89.99,
    description: 'Gasolina BP',
    date: '2024-01-13',
    type: TransactionType.WITHDRAWAL,
    sourceAccountId: '1',
    categoryId: 'cat3',
    notes: 'Llenar depósito',
    tags: ['transporte', 'gasolina'],
    reconciled: false,
    userId: 'user1',
    createdAt: '2024-01-13T18:20:00Z',
    updatedAt: '2024-01-13T18:20:00Z',
  },
  {
    id: '5',
    amount: -15.75,
    description: 'Café Starbucks',
    date: '2024-01-12',
    type: TransactionType.WITHDRAWAL,
    sourceAccountId: '1',
    categoryId: 'cat4',
    notes: 'Reunión de trabajo',
    tags: ['café', 'trabajo'],
    reconciled: true,
    userId: 'user1',
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-12T09:15:00Z',
  },
  {
    id: '6',
    amount: -350.00,
    description: 'Alquiler oficina',
    date: '2024-01-01',
    type: TransactionType.WITHDRAWAL,
    sourceAccountId: '2',
    categoryId: 'cat5',
    notes: 'Alquiler mensual',
    tags: ['alquiler', 'oficina'],
    reconciled: true,
    userId: 'user1',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
];

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalTransactions: number;
  filters: TransactionFilters;
  
  // Actions
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  createTransaction: (data: CreateTransactionData) => Promise<Transaction>;
  updateTransaction: (id: string, data: Partial<CreateTransactionData>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
  setTransactions: (transactions: Transaction[]) => void;
  reconcileTransaction: (id: string, reconciled: boolean) => Promise<void>;
}

const defaultFilters: TransactionFilters = {
  page: 1,
  limit: 20,
};

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: mockTransactions,
      isLoading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      totalTransactions: mockTransactions.length,
      filters: defaultFilters,

      fetchTransactions: async (filters = {}) => {
        set({ isLoading: true, error: null });
        
        try {
          const queryParams = new URLSearchParams();
          
          // Aplicar filtros
          Object.entries({ ...get().filters, ...filters }).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              queryParams.append(key, value.toString());
            }
          });

          const response = await apiClient.get<PaginatedResponse<Transaction>>(
            `/transactions?${queryParams.toString()}`
          );
          
          set({
            transactions: response.data.data,
            currentPage: response.data.page,
            totalPages: response.data.totalPages,
            totalTransactions: response.data.total,
            filters: { ...get().filters, ...filters },
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          // En modo desarrollo, usar datos mock
          const filtered = mockTransactions.filter(transaction => {
            const searchTerm = filters.search?.toLowerCase() || '';
            const matchesSearch = transaction.description.toLowerCase().includes(searchTerm) ||
                                transaction.notes?.toLowerCase().includes(searchTerm);
            
            const matchesType = !filters.type || transaction.type === filters.type;
            const matchesAccount = !filters.accountId || 
                                 transaction.sourceAccountId === filters.accountId ||
                                 transaction.destinationAccountId === filters.accountId;
            const matchesCategory = !filters.categoryId || transaction.categoryId === filters.categoryId;
            
            let matchesDate = true;
            if (filters.startDate) {
              matchesDate = matchesDate && transaction.date >= filters.startDate;
            }
            if (filters.endDate) {
              matchesDate = matchesDate && transaction.date <= filters.endDate;
            }
            
            return matchesSearch && matchesType && matchesAccount && matchesCategory && matchesDate;
          });

          const page = filters.page || 1;
          const limit = filters.limit || 20;
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedData = filtered.slice(startIndex, endIndex);

          set({
            transactions: paginatedData,
            currentPage: page,
            totalPages: Math.ceil(filtered.length / limit),
            totalTransactions: filtered.length,
            filters: { ...get().filters, ...filters },
            isLoading: false,
            error: null,
          });
        }
      },

      createTransaction: async (data: CreateTransactionData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.post<Transaction>('/transactions', data);
          const newTransaction = response.data;
          
          set((state) => ({
            transactions: [newTransaction, ...state.transactions],
            totalTransactions: state.totalTransactions + 1,
            isLoading: false,
            error: null,
          }));

          return newTransaction;
        } catch (error: unknown) {
          // Simulación para desarrollo
          const newTransaction: Transaction = {
            id: Date.now().toString(),
            ...data,
            reconciled: false,
            userId: 'user1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            transactions: [newTransaction, ...state.transactions],
            totalTransactions: state.totalTransactions + 1,
            isLoading: false,
            error: null,
          }));

          return newTransaction;
        }
      },

      updateTransaction: async (id: string, data: Partial<CreateTransactionData>) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.put<Transaction>(`/transactions/${id}`, data);
          const updatedTransaction = response.data;
          
          set((state) => ({
            transactions: state.transactions.map(transaction => 
              transaction.id === id ? updatedTransaction : transaction
            ),
            isLoading: false,
            error: null,
          }));

          return updatedTransaction;
        } catch (error: unknown) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al actualizar la transacción',
          });
          throw error;
        }
      },

      deleteTransaction: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await apiClient.delete(`/transactions/${id}`);
          
          set((state) => ({
            transactions: state.transactions.filter(transaction => transaction.id !== id),
            totalTransactions: state.totalTransactions - 1,
            isLoading: false,
            error: null,
          }));
        } catch (error: unknown) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al eliminar la transacción',
          });
          throw error;
        }
      },

      reconcileTransaction: async (id: string, reconciled: boolean) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.patch<Transaction>(`/transactions/${id}/reconcile`, {
            reconciled,
          });
          const updatedTransaction = response.data;
          
          set((state) => ({
            transactions: state.transactions.map(transaction => 
              transaction.id === id ? updatedTransaction : transaction
            ),
            isLoading: false,
            error: null,
          }));
        } catch (error: unknown) {
          // Simulación para desarrollo
          set((state) => ({
            transactions: state.transactions.map(transaction => 
              transaction.id === id 
                ? { ...transaction, reconciled, updatedAt: new Date().toISOString() }
                : transaction
            ),
            isLoading: false,
            error: null,
          }));
        }
      },

      getTransactionById: (id: string) => {
        return get().transactions.find(transaction => transaction.id === id);
      },

      setFilters: (filters: TransactionFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      clearFilters: () => {
        set({ filters: defaultFilters });
      },

      clearError: () => {
        set({ error: null });
      },

      setTransactions: (transactions: Transaction[]) => {
        set({ transactions });
      },
    }),
    {
      name: 'transaction-store',
      partialize: (state) => ({
        filters: state.filters,
      }),
    }
  )
);

// Selector hooks para un mejor rendimiento
export const useTransactions = () => useTransactionStore((state) => ({
  transactions: state.transactions,
  isLoading: state.isLoading,
  error: state.error,
  currentPage: state.currentPage,
  totalPages: state.totalPages,
  totalTransactions: state.totalTransactions,
  filters: state.filters,
}));

// Selector hooks estables para evitar loops infinitos
export const useTransactionActions = () => {
  return useMemo(() => {
    const store = useTransactionStore.getState();
    return {
      fetchTransactions: store.fetchTransactions,
      createTransaction: store.createTransaction,
      updateTransaction: store.updateTransaction,
      deleteTransaction: store.deleteTransaction,
      getTransactionById: store.getTransactionById,
      setFilters: store.setFilters,
      clearFilters: store.clearFilters,
      clearError: store.clearError,
      setTransactions: store.setTransactions,
      reconcileTransaction: store.reconcileTransaction,
    };
  }, []);
};

// Hooks individuales para mejor rendimiento
export const useFetchTransactions = () => useTransactionStore((state) => state.fetchTransactions);
export const useCreateTransaction = () => useTransactionStore((state) => state.createTransaction);
export const useUpdateTransaction = () => useTransactionStore((state) => state.updateTransaction);
export const useDeleteTransaction = () => useTransactionStore((state) => state.deleteTransaction);

// Hook para obtener estadísticas de transacciones
export const useTransactionStats = () => {
  return useTransactionStore((state) => {
    const transactions = state.transactions;
    
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.DEPOSIT)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === TransactionType.WITHDRAWAL)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalTransfers = transactions
      .filter(t => t.type === TransactionType.TRANSFER)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const reconciledCount = transactions.filter(t => t.reconciled).length;
    const pendingCount = transactions.filter(t => !t.reconciled).length;
    
    return {
      totalTransactions: transactions.length,
      totalIncome,
      totalExpenses,
      totalTransfers,
      netAmount: totalIncome - totalExpenses,
      reconciledCount,
      pendingCount,
      reconciledPercentage: transactions.length > 0 
        ? Math.round((reconciledCount / transactions.length) * 100) 
        : 0,
    };
  });
};