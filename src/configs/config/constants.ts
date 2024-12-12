export const ENV_VALUES = {
  NODE_ENVIRONMENTS: {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
  },
  DEFAULT_VALUES: {
    PORT: 3000,
    NODE_ENV: 'development',
  },
  PATHS: {
    SCREENSHOTS_FOLDER: './screenshots',
    COOKIE_FOLDER: `sessions`,
  },
} as const;
