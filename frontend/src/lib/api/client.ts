import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '@/types';

// Configuración base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor para añadir el token de autenticación
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor para manejar errores y refresh tokens
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            return this.client(originalRequest);
          } catch (refreshError) {
            this.logout();
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: unknown): ApiError {
    // Type guard para verificar si es un error de Axios
    if (this.isAxiosError(error)) {
      if (error.response) {
        // El servidor respondió con un código de estado de error
        return {
          message: error.response.data?.message || 'Error del servidor',
          statusCode: error.response.status,
          error: error.response.data?.error,
        };
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        return {
          message: 'Error de conexión',
          statusCode: 0,
          error: 'NETWORK_ERROR',
        };
      }
    }
    
    // Error genérico
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return {
      message,
      statusCode: 0,
      error: 'UNKNOWN_ERROR',
    };
  }

  private isAxiosError(error: unknown): error is {
    response?: {
      data?: { message?: string; error?: string };
      status: number;
    };
    request?: unknown;
  } {
    return typeof error === 'object' && error !== null && 'response' in error;
  }

  // Métodos de autenticación
  setAccessToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post('/auth/refresh', {
      refreshToken,
    });

    const { accessToken } = response.data;
    this.setAccessToken(accessToken);
  }

  logout(): void {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Métodos HTTP genéricos
  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // Método para inicializar el cliente con token existente
  initialize(): void {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.accessToken = token;
    }
  }

  // Método para obtener el cliente de Axios directamente (para casos especiales)
  getClient(): AxiosInstance {
    return this.client;
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient();

// Hook personalizado para usar el cliente API
export const useApiClient = () => {
  return apiClient;
};

export default apiClient;