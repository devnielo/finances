# Firefly III Clone - Backend

Modern NestJS backend for the Firefly III Clone personal finance management system.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL 13+ (optional for production)
- Redis 6+ (optional for caching)

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration.

4. **Start the development server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000/api/v1`

## 📁 Project Structure

```
src/
├── common/                 # Shared utilities and configurations
│   ├── config/            # Configuration files
│   ├── database/          # Database configuration
│   ├── filters/           # Exception filters
│   └── interceptors/      # Request/response interceptors
├── auth/                  # Authentication module
├── users/                 # User management
├── accounts/              # Financial accounts
├── transactions/          # Transaction management
├── categories/            # Category system
├── tags/                  # Tagging system
├── budgets/               # Budget management
├── bills/                 # Bill management
├── rules/                 # Transaction rules
├── reports/               # Reports and analytics
├── import-export/         # Data import/export
├── webhooks/              # Webhook system
├── currencies/            # Currency management
├── search/                # Search functionality
├── attachments/           # File attachments
├── recurrence/            # Recurring transactions
├── app.module.ts          # Root application module
├── app.controller.ts      # Basic API endpoints
└── main.ts               # Application bootstrap
```

## 🛠️ Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build for production
npm run start:prod         # Start production server

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# Application
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=firefly
DB_PASSWORD=firefly
DB_DATABASE=firefly_iii_clone

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Security
CORS_ENABLED=true
HELMET_ENABLED=true
RATE_LIMIT_ENABLED=true
```

### Database Setup

For development, the application uses SQLite by default. For production:

1. **Install PostgreSQL**
2. **Create database**
   ```sql
   CREATE DATABASE firefly_iii_clone;
   CREATE USER firefly WITH PASSWORD 'firefly';
   GRANT ALL PRIVILEGES ON DATABASE firefly_iii_clone TO firefly;
   ```
3. **Update .env with PostgreSQL configuration**
4. **Run migrations**
   ```bash
   npm run migration:run
   ```

## 📡 API Endpoints

### Health Check
- `GET /api/v1` - API status
- `GET /api/v1/health` - Health check

### Authentication (Coming Soon)
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - User logout

### Users (Coming Soon)
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `DELETE /api/v1/users/account` - Delete account

### Accounts (Coming Soon)
- `GET /api/v1/accounts` - List accounts
- `POST /api/v1/accounts` - Create account
- `GET /api/v1/accounts/:id` - Get account
- `PUT /api/v1/accounts/:id` - Update account
- `DELETE /api/v1/accounts/:id` - Delete account

## 🏗️ Architecture

### Design Patterns
- **Clean Architecture** - Separation of concerns
- **CQRS** - Command Query Responsibility Segregation
- **Repository Pattern** - Data access abstraction
- **Factory Pattern** - Object creation
- **Observer Pattern** - Event handling

### Technologies
- **NestJS 10+** - Node.js framework
- **TypeScript** - Type safety
- **TypeORM** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **JWT** - Authentication
- **Swagger** - API documentation
- **Jest** - Testing framework

## 🧪 Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📚 API Documentation

When running in development mode, Swagger documentation is available at:
- `http://localhost:3000/api/docs`

## 🔐 Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **Input Validation** - Request validation
- **JWT Authentication** - Secure authentication
- **Password Hashing** - bcrypt password protection
- **SQL Injection Protection** - TypeORM query builder

## 🚀 Deployment

### Docker (Recommended)

```bash
# Build Docker image
docker build -t firefly-backend .

# Run with Docker Compose
docker-compose up -d
```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

## 📈 Performance

- **Caching** - Redis-based caching
- **Database Optimization** - Indexes and query optimization
- **Connection Pooling** - Efficient database connections
- **Compression** - Response compression
- **Monitoring** - Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the [API Documentation](http://localhost:3000/api/docs)
- Review the [Project Documentation](../README.md)