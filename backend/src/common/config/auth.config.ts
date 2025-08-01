import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'firefly-iii-clone',
    audience: process.env.JWT_AUDIENCE || 'firefly-iii-clone-users',
  },

  // Password Configuration
  password: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH, 10) || 8,
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
    requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
    requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL !== 'false',
    saltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS, 10) || 12,
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
    name: process.env.SESSION_NAME || 'firefly.session',
    resave: process.env.SESSION_RESAVE === 'true',
    saveUninitialized: process.env.SESSION_SAVE_UNINITIALIZED === 'true',
    cookie: {
      maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: process.env.SESSION_HTTP_ONLY !== 'false',
      secure: process.env.SESSION_SECURE === 'true', // Set to true in production with HTTPS
      sameSite: process.env.SESSION_SAME_SITE || 'lax',
    },
  },

  // OAuth2 Configuration
  oauth2: {
    enabled: process.env.OAUTH2_ENABLED === 'true',
    providers: {
      google: {
        enabled: process.env.GOOGLE_OAUTH_ENABLED === 'true',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        scope: ['profile', 'email'],
      },
      github: {
        enabled: process.env.GITHUB_OAUTH_ENABLED === 'true',
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        scope: ['user:email'],
      },
      microsoft: {
        enabled: process.env.MICROSOFT_OAUTH_ENABLED === 'true',
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        scope: ['profile', 'email'],
      },
    },
  },

  // Two-Factor Authentication
  twoFactor: {
    enabled: process.env.TWO_FACTOR_ENABLED !== 'false',
    issuer: process.env.TWO_FACTOR_ISSUER || 'Firefly III Clone',
    window: parseInt(process.env.TWO_FACTOR_WINDOW, 10) || 1,
    recovery: {
      codesCount: parseInt(process.env.RECOVERY_CODES_COUNT, 10) || 8,
      codeLength: parseInt(process.env.RECOVERY_CODE_LENGTH, 10) || 8,
    },
  },

  // Account Security
  security: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION, 10) || 15 * 60 * 1000, // 15 minutes
    passwordResetExpiration: parseInt(process.env.PASSWORD_RESET_EXPIRATION, 10) || 60 * 60 * 1000, // 1 hour
    emailVerificationExpiration: parseInt(process.env.EMAIL_VERIFICATION_EXPIRATION, 10) || 24 * 60 * 60 * 1000, // 24 hours
  },

  // Rate Limiting for Auth Endpoints
  rateLimiting: {
    login: {
      ttl: parseInt(process.env.LOGIN_RATE_LIMIT_TTL, 10) || 60, // 1 minute
      limit: parseInt(process.env.LOGIN_RATE_LIMIT_COUNT, 10) || 5,
    },
    register: {
      ttl: parseInt(process.env.REGISTER_RATE_LIMIT_TTL, 10) || 60, // 1 minute
      limit: parseInt(process.env.REGISTER_RATE_LIMIT_COUNT, 10) || 3,
    },
    passwordReset: {
      ttl: parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_TTL, 10) || 300, // 5 minutes
      limit: parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_COUNT, 10) || 3,
    },
  },

  // Email Configuration for Auth
  email: {
    from: process.env.AUTH_EMAIL_FROM || 'noreply@firefly-iii-clone.com',
    templates: {
      verification: process.env.EMAIL_VERIFICATION_TEMPLATE || 'email-verification',
      passwordReset: process.env.EMAIL_PASSWORD_RESET_TEMPLATE || 'password-reset',
      welcomeEmail: process.env.EMAIL_WELCOME_TEMPLATE || 'welcome',
    },
  },
}));