const ALLOWED_NODE_ENVS = ['development', 'test', 'production'] as const;
const ALLOWED_DB_TYPES = ['postgres', 'sqlite'] as const;

type NodeEnv = (typeof ALLOWED_NODE_ENVS)[number];
type DatabaseType = (typeof ALLOWED_DB_TYPES)[number];
type RawEnvironment = Record<string, unknown>;

function parseNumber(value: unknown, fallback: number, key: string): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${key} must be a valid number.`);
  }

  return parsed;
}

function parseString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }
  }

  return fallback;
}

export function validateEnvironment(config: RawEnvironment): RawEnvironment {
  const nodeEnv = parseString(config.NODE_ENV, 'development');
  const dbType = parseString(config.DB_TYPE, 'postgres');

  if (!ALLOWED_NODE_ENVS.includes(nodeEnv as NodeEnv)) {
    throw new Error(
      `NODE_ENV must be one of: ${ALLOWED_NODE_ENVS.join(', ')}.`,
    );
  }

  if (!ALLOWED_DB_TYPES.includes(dbType as DatabaseType)) {
    throw new Error(`DB_TYPE must be one of: ${ALLOWED_DB_TYPES.join(', ')}.`);
  }

  const port = parseNumber(config.PORT, 3000, 'PORT');
  const dbPort = parseNumber(config.DB_PORT, 5432, 'DB_PORT');
  const authCookieMaxAgeMs = parseNumber(
    config.AUTH_COOKIE_MAX_AGE_MS,
    86_400_000,
    'AUTH_COOKIE_MAX_AGE_MS',
  );
  const authRefreshCookieMaxAgeMs = parseNumber(
    config.AUTH_REFRESH_COOKIE_MAX_AGE_MS,
    604_800_000,
    'AUTH_REFRESH_COOKIE_MAX_AGE_MS',
  );
  const ragDefaultTopK = parseNumber(
    config.RAG_DEFAULT_TOP_K,
    5,
    'RAG_DEFAULT_TOP_K',
  );
  const pythonApiTimeoutMs = parseNumber(
    config.PYTHON_API_TIMEOUT_MS,
    10_000,
    'PYTHON_API_TIMEOUT_MS',
  );
  const storageCacheTtlMs = parseNumber(
    config.STORAGE_CACHE_TTL_MS,
    30_000,
    'STORAGE_CACHE_TTL_MS',
  );

  if (port <= 0) {
    throw new Error('PORT must be greater than 0.');
  }

  if (dbPort <= 0) {
    throw new Error('DB_PORT must be greater than 0.');
  }

  if (authCookieMaxAgeMs <= 0) {
    throw new Error('AUTH_COOKIE_MAX_AGE_MS must be greater than 0.');
  }

  if (authRefreshCookieMaxAgeMs <= 0) {
    throw new Error('AUTH_REFRESH_COOKIE_MAX_AGE_MS must be greater than 0.');
  }

  if (ragDefaultTopK <= 0) {
    throw new Error('RAG_DEFAULT_TOP_K must be greater than 0.');
  }

  if (pythonApiTimeoutMs <= 0) {
    throw new Error('PYTHON_API_TIMEOUT_MS must be greater than 0.');
  }

  if (storageCacheTtlMs < 0) {
    throw new Error('STORAGE_CACHE_TTL_MS must be greater than or equal to 0.');
  }

  const jwtSecret = parseString(config.JWT_SECRET, 'change-this-in-development');
  const jwtRefreshSecret = parseString(
    config.JWT_REFRESH_SECRET,
    'change-this-refresh-secret-in-development',
  );
  if (nodeEnv === 'production' && jwtSecret === 'change-this-in-development') {
    throw new Error('JWT_SECRET must be set explicitly in production.');
  }
  if (
    nodeEnv === 'production' &&
    jwtRefreshSecret === 'change-this-refresh-secret-in-development'
  ) {
    throw new Error('JWT_REFRESH_SECRET must be set explicitly in production.');
  }

  return {
    ...config,
    NODE_ENV: nodeEnv,
    PORT: port,
    APP_NAME: parseString(config.APP_NAME, 'Hierarchical RAG API'),
    FRONTEND_ORIGIN: parseString(
      config.FRONTEND_ORIGIN,
      'http://localhost:5173',
    ),
    DB_TYPE: dbType,
    DB_HOST: parseString(config.DB_HOST, 'localhost'),
    DB_PORT: dbPort,
    DB_USERNAME: parseString(config.DB_USERNAME, 'postgres'),
    DB_PASSWORD: parseString(config.DB_PASSWORD, 'postgres'),
    DB_DATABASE: parseString(config.DB_DATABASE, 'hierarchical_rag'),
    DB_SYNCHRONIZE: parseBoolean(config.DB_SYNCHRONIZE, nodeEnv === 'test'),
    DB_LOGGING: parseBoolean(config.DB_LOGGING, false),
    DB_RUN_MIGRATIONS: parseBoolean(config.DB_RUN_MIGRATIONS, dbType === 'postgres'),
    DB_SSL: parseBoolean(config.DB_SSL, false),
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: parseString(config.JWT_EXPIRES_IN, '1d'),
    JWT_REFRESH_SECRET: jwtRefreshSecret,
    JWT_REFRESH_EXPIRES_IN: parseString(config.JWT_REFRESH_EXPIRES_IN, '7d'),
    AUTH_COOKIE_NAME: parseString(config.AUTH_COOKIE_NAME, 'access_token'),
    AUTH_REFRESH_COOKIE_NAME: parseString(
      config.AUTH_REFRESH_COOKIE_NAME,
      'refresh_token',
    ),
    AUTH_COOKIE_SECURE: parseBoolean(config.AUTH_COOKIE_SECURE, false),
    AUTH_COOKIE_SAME_SITE: parseString(config.AUTH_COOKIE_SAME_SITE, 'lax'),
    AUTH_COOKIE_DOMAIN: parseString(config.AUTH_COOKIE_DOMAIN, ''),
    AUTH_COOKIE_MAX_AGE_MS: authCookieMaxAgeMs,
    AUTH_REFRESH_COOKIE_MAX_AGE_MS: authRefreshCookieMaxAgeMs,
    ADMIN_EMAIL: parseString(config.ADMIN_EMAIL, 'admin@gmail.com').toLowerCase(),
    ADMIN_PASSWORD: parseString(config.ADMIN_PASSWORD, '123456aA@'),
    ADMIN_DISPLAY_NAME: parseString(
      config.ADMIN_DISPLAY_NAME,
      'System Administrator',
    ),
    PYTHON_API_BASE_URL: parseString(config.PYTHON_API_BASE_URL, 'http://127.0.0.1:8000'),
    PYTHON_FILES_UPLOAD_PATH: parseString(
      config.PYTHON_FILES_UPLOAD_PATH,
      '/files/upload',
    ),
    PYTHON_API_TIMEOUT_MS: pythonApiTimeoutMs,
    STORAGE_CACHE_TTL_MS: storageCacheTtlMs,
    RAG_DEFAULT_TOP_K: ragDefaultTopK,
    VECTOR_STORE_PROVIDER: parseString(config.VECTOR_STORE_PROVIDER, 'memory'),
    EMBEDDING_MODEL: parseString(
      config.EMBEDDING_MODEL,
      'text-embedding-3-small',
    ),
    CHAT_MODEL: parseString(config.CHAT_MODEL, 'gpt-4o-mini'),
  };
}
