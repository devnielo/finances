import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Account, CreateAccountData, AccountType } from '@/types';
import { apiClient } from '@/lib/api/client';

// Datos mock para desarrollo
const mockAccounts: Account[] = [
  {
    id: '1',
    name: 'Cuenta Corriente Principal',
    type: AccountType.ASSET,
    balance: 2500.75,
    currency: 'EUR',
    active: true,
    notes: 'Mi cuenta principal para gastos diarios',
    openingBalance: 1000.00,
    openingBalanceDate: '2024-01-01',
    userId: 'user1',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-15T12:30:00Z',
  },
  {
    id: '2',
    name: 'Cuenta de Ahorros',
    type: AccountType.ASSET,
    balance: 15000.00,
    currency: 'EUR',
    active: true,
    notes: 'Cuenta de ahorros a largo plazo',
    openingBalance: 10000.00,
    openingBalanceDate: '2023-06-01',
    userId: 'user1',
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2024-01-10T14:00:00Z',
  },
  {
    id: '3',
    name: 'Tarjeta de Crédito Visa',
    type: AccountType.LIABILITY,
    balance: -850.30,
    currency: 'EUR',
    active: true,
    notes: 'Tarjeta de crédito principal',
    openingBalance: 0.00,
    openingBalanceDate: '2023-03-15',
    userId: 'user1',
    createdAt: '2023-03-15T09:00:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
  },
  {
    id: '4',
    name: 'Gastos Alimentación',
    type: AccountType.EXPENSE,
    balance: -456.78,
    currency: 'EUR',
    active: true,
    notes: 'Categoría para gastos de comida y supermercado',
    openingBalance: 0.00,
    userId: 'user1',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-15T18:20:00Z',
  },
  {
    id: '5',
    name: 'Ingresos Salario',
    type: AccountType.REVENUE,
    balance: 3600.00,
    currency: 'EUR',
    active: true,
    notes: 'Ingresos mensuales por salario',
    openingBalance: 0.00,
    userId: 'user1',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
];

interface AccountState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAccounts: () => Promise<void>;
  createAccount: (data: CreateAccountData) => Promise<Account>;
  updateAccount: (id: string, data: Partial<CreateAccountData>) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
  getAccountById: (id: string) => Account | undefined;
  clearError: () => void;
  setAccounts: (accounts: Account[]) => void;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      accounts: mockAccounts, // Inicializar con datos mock
      isLoading: false,
      error: null,

      fetchAccounts: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.get<Account[]>('/accounts');
          
          set({
            accounts: response.data,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al cargar las cuentas',
          });
          throw error;
        }
      },

      createAccount: async (data: CreateAccountData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.post<Account>('/accounts', data);
          const newAccount = response.data;
          
          set((state) => ({
            accounts: [...state.accounts, newAccount],
            isLoading: false,
            error: null,
          }));

          return newAccount;
        } catch (error: unknown) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al crear la cuenta',
          });
          throw error;
        }
      },

      updateAccount: async (id: string, data: Partial<CreateAccountData>) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.put<Account>(`/accounts/${id}`, data);
          const updatedAccount = response.data;
          
          set((state) => ({
            accounts: state.accounts.map(account => 
              account.id === id ? updatedAccount : account
            ),
            isLoading: false,
            error: null,
          }));

          return updatedAccount;
        } catch (error: unknown) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al actualizar la cuenta',
          });
          throw error;
        }
      },

      deleteAccount: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await apiClient.delete(`/accounts/${id}`);
          
          set((state) => ({
            accounts: state.accounts.filter(account => account.id !== id),
            isLoading: false,
            error: null,
          }));
        } catch (error: unknown) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al eliminar la cuenta',
          });
          throw error;
        }
      },

      getAccountById: (id: string) => {
        return get().accounts.find(account => account.id === id);
      },

      clearError: () => {
        set({ error: null });
      },

      setAccounts: (accounts: Account[]) => {
        set({ accounts });
      },
    }),
    {
      name: 'account-store',
      partialize: (state) => ({
        accounts: state.accounts,
      }),
    }
  )
);

// Selector hooks para un mejor rendimiento
export const useAccounts = () => useAccountStore((state) => ({
  accounts: state.accounts,
  isLoading: state.isLoading,
  error: state.error,
}));

export const useAccountActions = () => useAccountStore((state) => ({
  fetchAccounts: state.fetchAccounts,
  createAccount: state.createAccount,
  updateAccount: state.updateAccount,
  deleteAccount: state.deleteAccount,
  getAccountById: state.getAccountById,
  clearError: state.clearError,
  setAccounts: state.setAccounts,
}));

// Hook para obtener cuentas filtradas por tipo
export const useAccountsByType = (type?: AccountType) => {
  return useAccountStore((state) => 
    type 
      ? state.accounts.filter(account => account.type === type)
      : state.accounts
  );
};

// Hook para obtener resumen de cuentas
export const useAccountSummary = () => {
  return useAccountStore((state) => {
    const accounts = state.accounts;
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    const assetAccounts = accounts.filter(account => account.type === AccountType.ASSET);
    const liabilityAccounts = accounts.filter(account => account.type === AccountType.LIABILITY);
    
    return {
      totalAccounts: accounts.length,
      totalBalance,
      assetCount: assetAccounts.length,
      liabilityCount: liabilityAccounts.length,
      assetBalance: assetAccounts.reduce((sum, account) => sum + account.balance, 0),
      liabilityBalance: liabilityAccounts.reduce((sum, account) => sum + account.balance, 0),
    };
  });
};