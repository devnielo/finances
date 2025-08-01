import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'firefly:',
    
    // Connection settings
    connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT, 10) || 10000,
    commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT, 10) || 5000,
    retryAttempts: parseInt(process.env.REDIS_RETRY_ATTEMPTS, 10) || 3,
    retryDelay: parseInt(process.env.REDIS_RETRY_DELAY, 10) || 2000,
    
    // Pool settings
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES_PER_REQUEST, 10) || 3,
    enableReadyCheck: process.env.REDIS_ENABLE_READY_CHECK !== 'false',
    
    // Cluster configuration (if using Redis Cluster)
    cluster: {
      enabled: process.env.REDIS_CLUSTER_ENABLED === 'true',
      nodes: process.env.REDIS_CLUSTER_NODES?.split(',') || [],
    },
  },

  // Cache TTL Settings (in seconds)
  ttl: {
    default: parseInt(process.env.CACHE_TTL_DEFAULT, 10) || 300, // 5 minutes
    short: parseInt(process.env.CACHE_TTL_SHORT, 10) || 60, // 1 minute
    medium: parseInt(process.env.CACHE_TTL_MEDIUM, 10) || 900, // 15 minutes
    long: parseInt(process.env.CACHE_TTL_LONG, 10) || 3600, // 1 hour
    veryLong: parseInt(process.env.CACHE_TTL_VERY_LONG, 10) || 86400, // 24 hours
    
    // Specific entity TTLs
    user: parseInt(process.env.CACHE_TTL_USER, 10) || 1800, // 30 minutes
    account: parseInt(process.env.CACHE_TTL_ACCOUNT, 10) || 600, // 10 minutes
    transaction: parseInt(process.env.CACHE_TTL_TRANSACTION, 10) || 300, // 5 minutes
    category: parseInt(process.env.CACHE_TTL_CATEGORY, 10) || 3600, // 1 hour
    budget: parseInt(process.env.CACHE_TTL_BUDGET, 10) || 1800, // 30 minutes
    bill: parseInt(process.env.CACHE_TTL_BILL, 10) || 1800, // 30 minutes
    report: parseInt(process.env.CACHE_TTL_REPORT, 10) || 900, // 15 minutes
    currency: parseInt(process.env.CACHE_TTL_CURRENCY, 10) || 86400, // 24 hours
  },

  // Cache Keys
  keys: {
    user: {
      profile: (userId: string) => `user:profile:${userId}`,
      preferences: (userId: string) => `user:preferences:${userId}`,
      permissions: (userId: string) => `user:permissions:${userId}`,
    },
    account: {
      list: (userId: string) => `accounts:user:${userId}`,
      balance: (accountId: string) => `account:balance:${accountId}`,
      transactions: (accountId: string, page: number) => `account:transactions:${accountId}:${page}`,
    },
    transaction: {
      list: (userId: string, page: number) => `transactions:user:${userId}:${page}`,
      summary: (userId: string, period: string) => `transactions:summary:${userId}:${period}`,
    },
    category: {
      list: (userId: string) => `categories:user:${userId}`,
      spending: (categoryId: string, period: string) => `category:spending:${categoryId}:${period}`,
    },
    budget: {
      list: (userId: string) => `budgets:user:${userId}`,
      current: (budgetId: string) => `budget:current:${budgetId}`,
    },
    report: {
      dashboard: (userId: string) => `report:dashboard:${userId}`,
      monthly: (userId: string, month: string) => `report:monthly:${userId}:${month}`,
      yearly: (userId: string, year: string) => `report:yearly:${userId}:${year}`,
    },
    currency: {
      list: () => 'currencies:list',
      rates: () => 'currencies:rates',
    },
  },

  // Cache Strategies
  strategies: {
    // Write-through: Write to cache and database simultaneously
    writeThrough: process.env.CACHE_STRATEGY_WRITE_THROUGH === 'true',
    
    // Write-behind: Write to cache immediately, database asynchronously
    writeBehind: process.env.CACHE_STRATEGY_WRITE_BEHIND === 'true',
    
    // Cache-aside: Application manages cache manually
    cacheAside: process.env.CACHE_STRATEGY_CACHE_ASIDE !== 'false',
  },

  // Cache Invalidation
  invalidation: {
    // Automatic invalidation on entity updates
    autoInvalidate: process.env.CACHE_AUTO_INVALIDATE !== 'false',
    
    // Patterns for bulk invalidation
    patterns: {
      userData: (userId: string) => [`user:*:${userId}`, `*:user:${userId}*`],
      accountData: (accountId: string) => [`account:*:${accountId}`, `*:account:${accountId}*`],
      transactionData: (userId: string) => [`transactions:*:${userId}*`, `report:*:${userId}*`],
    },
  },

  // Performance Settings
  performance: {
    // Maximum memory usage for cache (in MB)
    maxMemory: parseInt(process.env.CACHE_MAX_MEMORY, 10) || 256,
    
    // Eviction policy
    evictionPolicy: process.env.CACHE_EVICTION_POLICY || 'allkeys-lru',
    
    // Compression
    compression: {
      enabled: process.env.CACHE_COMPRESSION_ENABLED === 'true',
      threshold: parseInt(process.env.CACHE_COMPRESSION_THRESHOLD, 10) || 1024, // 1KB
    },
    
    // Serialization
    serialization: process.env.CACHE_SERIALIZATION || 'json', // json, msgpack, etc.
  },

  // Monitoring and Metrics
  monitoring: {
    enabled: process.env.CACHE_MONITORING_ENABLED !== 'false',
    metricsInterval: parseInt(process.env.CACHE_METRICS_INTERVAL, 10) || 60000, // 1 minute
    slowLogThreshold: parseInt(process.env.CACHE_SLOW_LOG_THRESHOLD, 10) || 100, // 100ms
  },
}));