import { config } from 'dotenv';

// Cargar variables de entorno para testing
config({ path: '.env.test' });

// Configuración global para tests
beforeAll(() => {
  // Configurar timezone para tests consistentes
  process.env.TZ = 'UTC';
  
  // Silenciar logs durante tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  // Restaurar console methods
  jest.restoreAllMocks();
});

// Mock global para fetch si es necesario
global.fetch = jest.fn();

// Configuración de timeout por defecto
jest.setTimeout(30000);