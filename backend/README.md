# Firefly III Clone API

Una implementación moderna y escalable de un sistema de gestión financiera personal inspirado en Firefly III, construida con NestJS, TypeORM y PostgreSQL.

## 🚀 Características Principales

### 🔐 Autenticación y Seguridad
- Autenticación JWT con refresh tokens
- Two-Factor Authentication (2FA) con TOTP
- Códigos de backup para recuperación
- Guards globales de seguridad
- Validación robusta de datos

### 💰 Gestión de Cuentas
- Múltiples tipos de cuenta (Asset, Expense, Revenue, Liability)
- Validación de IBAN y números de cuenta
- Cálculo automático de balances
- Gestión de metadatos y monedas
- Reordenamiento de cuentas

### 💸 Transacciones Avanzadas
- Tipos de transacción (withdrawal, deposit, transfer)
- Split transactions (transacciones divididas)
- Soporte para múltiples monedas
- Sistema de reconciliación bancaria
- Filtrado y búsqueda avanzada
- Resúmenes estadísticos

### 📊 Reportes y Análisis
- Resúmenes financieros automáticos
- Estadísticas de ingresos y gastos
- Balances por cuenta en tiempo real
- Métricas de flujo de efectivo

## 🛠️ Stack Tecnológico

- **Backend**: NestJS 10+ con TypeScript
- **Base de Datos**: PostgreSQL 15+ con TypeORM
- **Autenticación**: JWT + 2FA (TOTP)
- **Validación**: class-validator + class-transformer
- **Documentación**: Swagger/OpenAPI 3.0
- **Testing**: Jest + Supertest
- **Arquitectura**: Clean Architecture + DDD

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 15+
- npm o yarn

## 🚀 Instalación y Setup

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd firefly-iii-clone/backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Configurar las variables necesarias:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=firefly_clone

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1d

# 2FA
TWO_FACTOR_SERVICE_NAME=Firefly III Clone
TWO_FACTOR_ISSUER=firefly-clone
```

### 4. Configurar base de datos

```bash
# Crear base de datos
createdb firefly_clone

# Ejecutar migraciones
npm run migration:run

# (Opcional) Ejecutar seeds
npm run seed
```

### 5. Iniciar el servidor

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 📚 Documentación de la API

### Swagger/OpenAPI

Una vez que el servidor esté ejecutándose, la documentación interactiva estará disponible en:

- **Desarrollo**: http://localhost:3000/api/docs
- **Producción**: https://your-domain.com/api/docs

### Endpoints Principales

#### 🔐 Autenticación

```http
POST /api/v1/auth/register    # Registro de usuario
POST /api/v1/auth/login       # Inicio de sesión
GET  /api/v1/auth/profile     # Perfil del usuario
POST /api/v1/auth/2fa/setup   # Configurar 2FA
POST /api/v1/auth/2fa/enable  # Habilitar 2FA
POST /api/v1/auth/2fa/verify  # Verificar código 2FA
```

#### 💰 Cuentas

```http
POST   /api/v1/accounts           # Crear cuenta
GET    /api/v1/accounts           # Listar cuentas
GET    /api/v1/accounts/summary   # Resumen financiero
GET    /api/v1/accounts/:id       # Detalles de cuenta
PATCH  /api/v1/accounts/:id       # Actualizar cuenta
DELETE /api/v1/accounts/:id       # Eliminar cuenta
```

#### 💸 Transacciones

```http
POST   /api/v1/transactions           # Crear transacción
GET    /api/v1/transactions           # Listar transacciones
GET    /api/v1/transactions/summary   # Resumen estadístico
GET    /api/v1/transactions/:id       # Detalles de transacción
PATCH  /api/v1/transactions/:id       # Actualizar transacción
DELETE /api/v1/transactions/:id       # Eliminar transacción
```

### Autenticación

Todos los endpoints (excepto registro y login) requieren autenticación JWT:

```http
Authorization: Bearer <your-jwt-token>
```

### Ejemplos de Uso

#### Crear una cuenta

```bash
curl -X POST http://localhost:3000/api/v1/accounts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cuenta Corriente",
    "type": "asset",
    "currencyCode": "EUR",
    "openingBalance": 1000.00
  }'
```

#### Crear una transacción

```bash
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "withdrawal",
    "description": "Compra en supermercado",
    "date": "2023-12-01",
    "splits": [
      {
        "sourceAccountId": "uuid-cuenta-origen",
        "destinationAccountId": "uuid-cuenta-destino",
        "amount": 45.60,
        "description": "Groceries"
      }
    ]
  }'
```

## 🧪 Testing

### Tests Unitarios

```bash
# Ejecutar tests unitarios
npm run test

# Con coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Tests de Integración (E2E)

```bash
# Ejecutar tests e2e
npm run test:e2e

# Con base de datos de test
NODE_ENV=test npm run test:e2e
```

### Coverage

Los reportes de coverage se generan en `./coverage/`:

- `coverage/lcov-report/index.html` - Reporte HTML
- `coverage/lcov.info` - Formato LCOV

## 🏗️ Arquitectura

### Estructura del Proyecto

```
src/
├── auth/                 # Módulo de autenticación
├── users/               # Gestión de usuarios
├── accounts/            # Gestión de cuentas
├── transactions/        # Gestión de transacciones
├── common/              # Utilidades compartidas
│   ├── config/         # Configuraciones
│   ├── database/       # Setup de base de datos
│   ├── decorators/     # Decorators personalizados
│   ├── entities/       # Entidades base
│   ├── guards/         # Guards de seguridad
│   └── pipes/          # Pipes de validación
└── main.ts             # Punto de entrada
```

### Principios de Diseño

- **Clean Architecture**: Separación clara de responsabilidades
- **Domain-Driven Design**: Modelado basado en el dominio del negocio
- **SOLID Principles**: Código mantenible y extensible
- **Repository Pattern**: Abstracción de acceso a datos
- **Guard Pattern**: Seguridad por defecto

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev         # Servidor en modo desarrollo
npm run start:debug       # Servidor con debugging

# Build
npm run build            # Compilar para producción
npm run start:prod       # Servidor en producción

# Base de datos
npm run migration:generate  # Generar nueva migración
npm run migration:run      # Ejecutar migraciones
npm run migration:revert   # Revertir última migración
npm run seed              # Ejecutar seeds

# Testing
npm run test             # Tests unitarios
npm run test:watch       # Tests en modo watch
npm run test:cov         # Tests con coverage
npm run test:e2e         # Tests de integración

# Linting y formato
npm run lint             # Ejecutar ESLint
npm run format           # Formatear código con Prettier
```

## 🌍 Variables de Entorno

### Aplicación
- `NODE_ENV` - Entorno (development/production/test)
- `APP_PORT` - Puerto del servidor (default: 3000)
- `APP_NAME` - Nombre de la aplicación

### Base de Datos
- `DB_HOST` - Host de PostgreSQL
- `DB_PORT` - Puerto de PostgreSQL (default: 5432)
- `DB_USERNAME` - Usuario de base de datos
- `DB_PASSWORD` - Contraseña de base de datos
- `DB_DATABASE` - Nombre de la base de datos

### Autenticación
- `JWT_SECRET` - Clave secreta para JWT
- `JWT_EXPIRES_IN` - Tiempo de expiración del token

### 2FA
- `TWO_FACTOR_SERVICE_NAME` - Nombre del servicio para 2FA
- `TWO_FACTOR_ISSUER` - Emisor para códigos 2FA

## 🚀 Deployment

### Docker

```bash
# Build imagen
docker build -t firefly-clone-api .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e DB_USERNAME=your-username \
  -e DB_PASSWORD=your-password \
  firefly-clone-api
```

### Docker Compose

```bash
# Levantar toda la aplicación
docker-compose up -d

# Solo la API
docker-compose up api
```

## 📊 Monitoreo y Logging

- Logs estructurados con Winston
- Métricas de performance
- Health checks en `/health`
- Prometheus metrics en `/metrics`

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Add nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código

- TypeScript estricto
- ESLint + Prettier
- Tests obligatorios para nuevas funcionalidades
- Documentación actualizada

## 📄 Licencia

Este proyecto está licenciado bajo la licencia AGPL-3.0 - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentación**: [API Docs](http://localhost:3000/api/docs)
- **Email**: support@your-domain.com

## 📈 Roadmap

- [ ] Sistema de categorías avanzado
- [ ] Presupuestos y metas financieras
- [ ] Importación de transacciones bancarias
- [ ] Dashboard analytics avanzado
- [ ] Aplicación móvil
- [ ] Integración con bancos (PSD2)
- [ ] Sistema de notificaciones
- [ ] Multi-tenancy