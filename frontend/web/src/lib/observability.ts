/**
 * Observability & Telemetry Client
 * ─────────────────────────────────────────────────────────────────────────────
 * Structured event capture for frontend crashes, API errors, latency, and
 * user interactions.
 *
 * Architecture: Adapters pattern — core events are always captured via
 * structured console telemetry. When Sentry/PostHog SDKs are configured
 * (via env vars), events are forwarded to those platforms via window globals.
 *
 * To enable full integrations, install and initialize the SDKs:
 *   pnpm --filter @hireflow/web add @sentry/react posthog-js
 *
 * Then add VITE_SENTRY_DSN and VITE_POSTHOG_KEY to your .env file.
 */

// ─── SDK Adapter Interfaces ───────────────────────────────────────────────────

/** Access Sentry via window global (initialized by SDK in main.tsx) */
const getSentry = (): any => (window as any).__SENTRY__?.hub

/** Access PostHog via window global (initialized by posthog-js auto-init) */
const getPostHog = (): any => (window as any).posthog

function captureSentryError(error: Error, context?: Record<string, unknown>): void {
  try {
    const sentry = getSentry()
    if (sentry?.captureException) {
      sentry.captureException(error, { extra: context })
    }
  } catch {
    // no-op
  }
}

function capturePostHogEvent(event: string, properties?: Record<string, unknown>): void {
  try {
    const ph = getPostHog()
    if (ph?.capture) {
      ph.capture(event, properties)
    }
  } catch {
    // no-op
  }
}

// ─── Telemetry API ────────────────────────────────────────────────────────────

export const telemetry = {
  /**
   * Capture a rendering crash or React boundary error
   */
  captureCrash: (error: Error, componentInfo?: string) => {
    console.group('%c🚨 [Telemetry] Component Crash Caught', 'color: #ef4444; font-weight: bold; font-size: 11px;')
    console.error('Error Details:', error.message)
    if (componentInfo) console.warn('Component Stack:', componentInfo)
    console.groupEnd()

    captureSentryError(error, { componentInfo })
    capturePostHogEvent('frontend_crash', { message: error.message, componentInfo })
  },

  /**
   * Capture query latency or slow responses (>2000ms)
   */
  trackLatency: (path: string, durationMs: number) => {
    if (durationMs > 2000) {
      console.warn(
        `%c⚠️ [Telemetry] Slow API Request: ${path} took ${durationMs}ms`,
        'color: #f59e0b; font-weight: 500;'
      )
      capturePostHogEvent('slow_api_request', { path, durationMs })
    }
  },

  /**
   * Capture query failures / status errors
   */
  captureApiError: (path: string, error: unknown) => {
    console.group('%c❌ [Telemetry] API Request Failed', 'color: #ef4444; font-weight: bold;')
    console.error(`Route: ${path}`)
    console.error('Details:', error)
    console.groupEnd()

    if (error instanceof Error) captureSentryError(error, { path })
    capturePostHogEvent('api_error', {
      path,
      message: error instanceof Error ? error.message : String(error),
    })
  },

  /**
   * Capture a page navigation event
   */
  captureNavigation: (from: string, to: string) => {
    capturePostHogEvent('page_navigation', { from, to })
  },

  /**
   * Capture a significant user action (button click, form submit, etc.)
   */
  captureUserAction: (action: string, properties?: Record<string, unknown>) => {
    capturePostHogEvent(action, properties)
  },

  /**
   * Mark a performance milestone (e.g. "first-data-visible")
   */
  capturePerformanceMark: (name: string, durationMs?: number) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(name)
    }
    if (durationMs !== undefined) {
      capturePostHogEvent('performance_mark', { name, durationMs })
    }
  },
}
