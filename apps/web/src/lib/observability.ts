/**
 * Observability & Telemetry Client
 * ─────────────────────────────────────────────────────────────────────────────
 * Captures query errors, rendering failures, slow API routes, and captures them
 * into structured console telemetry. Easy drop-in placeholder for Sentry/Datadog.
 */

export const telemetry = {
  /**
   * Capture a rendering crash or React boundary error
   */
  captureCrash: (error: Error, componentInfo?: string) => {
    console.group('%c🚨 [Telemetry] Component Crash Caught', 'color: #ef4444; font-weight: bold; font-size: 11px;')
    console.error('Error Details:', error.message)
    if (componentInfo) {
      console.warn('Component Stack:', componentInfo)
    }
    console.groupEnd()
  },

  /**
   * Capture query latency or slow responses (>2000ms)
   */
  trackLatency: (path: string, durationMs: number) => {
    if (durationMs > 2000) {
      console.warn(
        `%c⚠️ [Telemetry] Slow API Request Detected: GET ${path} took ${durationMs}ms`,
        'color: #f59e0b; font-weight: 500;'
      )
    }
  },

  /**
   * Capture query failures / status errors
   */
  captureApiError: (path: string, error: any) => {
    console.group('%c❌ [Telemetry] API Request Failed', 'color: #ef4444; font-weight: bold;')
    console.error(`Route: ${path}`)
    console.error('Payload/Details:', error)
    console.groupEnd()
  }
}
