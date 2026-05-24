import { telemetry } from '@/lib/observability'

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8000/api/v1'
const DEFAULT_TIMEOUT_MS = 10_000

function getAuthHeader(): string {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('hf_token') : null
  if (token) return `Bearer ${token}`

  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('hf_role') : null
  if (stored === 'recruiter') return 'Bearer mock-recruiter-token'
  return 'Bearer mock-candidate-token'
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: { field?: string; message: string }[]
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function httpGet<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`)

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v))
      }
    })
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
  const startTime = performance.now()

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      signal: controller.signal,
    })

    clearTimeout(timer)
    telemetry.trackLatency(path, performance.now() - startTime)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new ApiError(res.status, body.message ?? `HTTP ${res.status}`, body.errors)
    }

    return res.json() as Promise<T>
  } catch (err) {
    clearTimeout(timer)
    if ((err as Error).name === 'AbortError') {
      throw new ApiError(408, 'Request timed out — please try again')
    }
    throw err
  }
}

export async function httpPost<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
  const startTime = performance.now()

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timer)
    telemetry.trackLatency(path, performance.now() - startTime)

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new ApiError(res.status, errBody.message ?? `HTTP ${res.status}`, errBody.errors)
    }

    return res.json() as Promise<T>
  } catch (err) {
    clearTimeout(timer)
    if ((err as Error).name === 'AbortError') {
      throw new ApiError(408, 'Request timed out — please try again')
    }
    throw err
  }
}


export async function httpPut<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
  const startTime = performance.now()

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timer)
    telemetry.trackLatency(path, performance.now() - startTime)

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new ApiError(res.status, errBody.message ?? `HTTP ${res.status}`, errBody.errors)
    }

    return res.json() as Promise<T>
  } catch (err) {
    clearTimeout(timer)
    if ((err as Error).name === 'AbortError') {
      throw new ApiError(408, 'Request timed out — please try again')
    }
    throw err
  }
}


export async function httpPatch<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
  const startTime = performance.now()

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timer)
    telemetry.trackLatency(path, performance.now() - startTime)

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new ApiError(res.status, errBody.message ?? `HTTP ${res.status}`, errBody.errors)
    }

    return res.json() as Promise<T>
  } catch (err) {
    clearTimeout(timer)
    if ((err as Error).name === 'AbortError') {
      throw new ApiError(408, 'Request timed out — please try again')
    }
    throw err
  }
}

export async function httpDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
    },
  })

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    throw new ApiError(res.status, errBody.message ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}
