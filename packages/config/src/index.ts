export const CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  API: {
    TIMEOUT_MS: 10000,
    RATE_LIMIT: {
      WINDOW_MS: 60 * 1000, // 1 minute
      MAX_REQUESTS: 100,
    },
  },
}
