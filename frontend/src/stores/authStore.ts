import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { User, AuthTokens, LoginCredentials, RegisterCredentials } from '@/types';
import { apiClient } from '@/lib/api/client';
import { useMemo } from 'react';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  verifyTwoFactor: (token: string, code: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.post<{
            user: User;
            tokens: AuthTokens;
            requiresTwoFactor?: boolean;
          }>('/auth/login', credentials);

          if (response.data.requiresTwoFactor) {
            // Si requiere 2FA, no establecer el usuario aún
            set({ isLoading: false });
            return;
          }

          const { user, tokens } = response.data;
          
          // Guardar tokens
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          
          // Establecer token en el cliente API
          apiClient.setAccessToken(tokens.accessToken);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al iniciar sesión',
          });
          throw error;
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.post<{
            user: User;
            tokens: AuthTokens;
          }>('/auth/register', credentials);

          const { user, tokens } = response.data;
          
          // Guardar tokens
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          
          // Establecer token en el cliente API
          apiClient.setAccessToken(tokens.accessToken);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al registrarse',
          });
          throw error;
        }
      },

      logout: () => {
        // Limpiar tokens del localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Limpiar token del cliente API
        apiClient.logout();
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      verifyTwoFactor: async (token: string, code: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.post<{
            user: User;
            tokens: AuthTokens;
          }>('/auth/2fa/verify', { token, code });

          const { user, tokens } = response.data;
          
          // Guardar tokens
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          
          // Establecer token en el cliente API
          apiClient.setAccessToken(tokens.accessToken);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Código de verificación inválido',
          });
          throw error;
        }
      },

      refreshAuth: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          return;
        }

        set({ isLoading: true });
        
        try {
          apiClient.setAccessToken(token);
          
          const response = await apiClient.get<User>('/auth/me');
          
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Si falla la verificación, limpiar todo
          get().logout();
          set({ isLoading: false });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User) => {
        set({ user });
      },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
        // Mejorar la hidratación para SSR
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Restaurar el token en el cliente API después de la hidratación
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            if (token && state.isAuthenticated) {
              apiClient.setAccessToken(token);
            }
          }
        },
      }
    )
  )
);

// Selector hooks estables para evitar loops infinitos
const userSelector = (state: AuthState) => state.user;
const isAuthenticatedSelector = (state: AuthState) => state.isAuthenticated;
const isLoadingSelector = (state: AuthState) => state.isLoading;
const errorSelector = (state: AuthState) => state.error;

// Hook optimizado que evita recrear objetos
export const useAuth = () => {
  const user = useAuthStore(userSelector);
  const isAuthenticated = useAuthStore(isAuthenticatedSelector);
  const isLoading = useAuthStore(isLoadingSelector);
  const error = useAuthStore(errorSelector);

  return useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      error,
    }),
    [user, isAuthenticated, isLoading, error]
  );
};

// Hooks individuales para un mejor rendimiento
export const useUser = () => useAuthStore(userSelector);
export const useIsAuthenticated = () => useAuthStore(isAuthenticatedSelector);
export const useAuthLoading = () => useAuthStore(isLoadingSelector);
export const useAuthError = () => useAuthStore(errorSelector);

// Selector hooks para acciones - usando memoización estable
export const useAuthActions = () => {
  return useMemo(() => {
    const store = useAuthStore.getState();
    return {
      login: store.login,
      register: store.register,
      logout: store.logout,
      verifyTwoFactor: store.verifyTwoFactor,
      refreshAuth: store.refreshAuth,
      clearError: store.clearError,
      setUser: store.setUser,
    };
  }, []);
};

// Hooks individuales para un mejor rendimiento
export const useLogin = () => useAuthStore((state) => state.login);
export const useRegister = () => useAuthStore((state) => state.register);
export const useLogout = () => useAuthStore((state) => state.logout);
export const useRefreshAuth = () => useAuthStore((state) => state.refreshAuth);
export const useClearError = () => useAuthStore((state) => state.clearError);