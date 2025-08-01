# 🚀 FinanceApp Frontend

Frontend moderno para gestión financiera personal, construido con Next.js 14 y diseño inspirado en Spotify con paleta morada.

## ✨ Características Implementadas

### 🎨 **Diseño y UI/UX**
- ✅ Paleta de colores morada inspirada en Spotify
- ✅ Layout responsive con sidebar y header
- ✅ Dark mode como tema principal
- ✅ Componentes UI modernos y accesibles
- ✅ Animaciones fluidas con Framer Motion

### 🔐 **Sistema de Autenticación**
- ✅ Páginas de login y registro
- ✅ Validación de formularios con Zod
- ✅ Indicador de fuerza de contraseña
- ✅ Integración con JWT tokens
- ✅ Estado global con Zustand

### 📊 **Dashboard Financiero**
- ✅ Dashboard principal con métricas
- ✅ Cards de estadísticas financieras
- ✅ Vista de cuentas y transacciones
- ✅ Acciones rápidas
- ✅ Placeholders para gráficos

### 🛠️ **Tecnologías**
- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Estado**: Zustand
- **Validación**: React Hook Form + Zod
- **HTTP**: Axios con interceptores
- **Cache**: React Query
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Páginas de autenticación
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── globals.css        # Estilos globales
│   │   ├── layout.tsx         # Layout raíz
│   │   └── page.tsx           # Página de inicio
│   ├── components/            # Componentes reutilizables
│   │   ├── layout/           # Componentes de layout
│   │   │   ├── Header.tsx    # Header con navegación
│   │   │   ├── Layout.tsx    # Layout principal
│   │   │   └── Sidebar.tsx   # Sidebar navegación
│   │   └── ui/               # Componentes UI base
│   │       ├── Button.tsx    # Componente Button
│   │       ├── Card.tsx      # Componentes Card
│   │       └── Input.tsx     # Componente Input
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilidades y configuración
│   │   ├── api/             # Cliente API
│   │   ├── utils/           # Funciones utilitarias
│   │   ├── validations/     # Esquemas de validación
│   │   └── react-query.ts   # Configuración React Query
│   ├── stores/              # Stores de Zustand
│   │   └── authStore.ts     # Store de autenticación
│   └── types/               # Tipos TypeScript
└── ...
```

## 🎯 Estado Actual de Desarrollo

### ✅ **Completado (11/15 tareas)**
1. ✅ Configurar proyecto Next.js 14 con TypeScript
2. ✅ Instalar y configurar dependencias principales
3. ✅ Crear estructura de carpetas y arquitectura base
4. ✅ Implementar sistema de diseño con paleta morada
5. ✅ Configurar componentes base y layout
6. ✅ Implementar sistema de autenticación
7. ✅ Crear páginas protegidas y guards de rutas
8. ✅ Desarrollar Dashboard financiero con métricas
9. ✅ Implementar estado global con Zustand
10. ✅ Añadir animaciones con Framer Motion
11. ✅ Optimizar responsive design y accesibilidad

### 🔄 **Pendiente (4/15 tareas)**
12. ⏳ Implementar gestión de cuentas (CRUD completo)
13. ⏳ Crear gestión de transacciones con filtros avanzados
14. ⏳ Desarrollar sistema de categorías jerárquicas
15. ⏳ Configurar integración con backend existente

## 🚀 Cómo ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## 🌐 Variables de Entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📝 Próximos Pasos

1. **Conectar con Backend**: Integrar llamadas reales a la API NestJS
2. **Páginas CRUD**: Implementar páginas completas para cuentas, transacciones y categorías
3. **Gráficos**: Añadir Recharts para visualizaciones avanzadas
4. **2FA**: Implementar autenticación de dos factores
5. **Testing**: Añadir tests unitarios y de integración

## 🔗 Integración con Backend

El frontend está preparado para conectarse con el backend NestJS existente en `../backend/`. El cliente API en `src/lib/api/client.ts` está configurado para manejar:

- Autenticación JWT con refresh tokens
- Interceptores de request/response
- Manejo de errores centralizado
- Reintentos automáticos

---

**Estado**: 🟢 Frontend base completamente funcional y listo para expansión
**Última actualización**: Enero 2024
