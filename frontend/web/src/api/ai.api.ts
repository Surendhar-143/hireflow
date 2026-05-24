/**
 * AI-Native API Service Client
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { httpPost } from '@/api/http'
import type { ApiResponse, JobDTO } from '@hireflow/types'

export interface JobWithMatchDTO extends JobDTO {
  aiMatchScore?: number
}

export interface ParsedResumeDTO {
  name: string
  email: string
  headline: string
  bio: string
  skills: string[]
  experience: any[]
  education: any[]
}

export const aiApi = {
  /**
   * Performs high-fidelity hybrid keyword + semantic search
   */
  searchHybrid: async (query: string): Promise<JobWithMatchDTO[]> => {
    const res = await httpPost<ApiResponse<JobWithMatchDTO[]>>('/ai/search/hybrid', { q: query })
    return res.data
  },

  /**
   * Resolves overall AI recommendations score matching for candidate profile
   */
  matchJobs: async (candidateId?: string): Promise<JobWithMatchDTO[]> => {
    const res = await httpPost<ApiResponse<JobWithMatchDTO[]>>('/ai/match', { candidateId })
    return res.data
  },

  /**
   * High-fidelity structured entity extraction from raw resume text
   */
  parseResume: async (resumeText: string): Promise<ParsedResumeDTO> => {
    const res = await httpPost<ApiResponse<ParsedResumeDTO>>('/ai/parse-resume', { resumeText })
    return res.data
  },

  /**
   * Establishes real-time connection to conversational SSE gateway
   */
  chatAssistantStream: (
    message: string,
    context: any,
    onToken: (token: string) => void,
    onComplete: () => void,
    onError: (err: any) => void
  ): (() => void) => {
    const controller = new AbortController()
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('hf_role') : null
    const authHeader = stored === 'recruiter' ? 'Bearer mock-recruiter-token' : 'Bearer mock-candidate-token'
    const API_BASE = (import.meta as any).env?.VITE_API_URL ?? 'https://hireflow-backend.onrender.com/api/v1'

    fetch(`${API_BASE}/ai/chat/assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({ message, context }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        if (!response.body) {
          throw new Error('ReadableStream not supported')
        }
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const cleanLine = line.trim()
            if (!cleanLine) continue

            if (cleanLine.startsWith('data: ')) {
              const data = cleanLine.slice(6)
              if (data === '[DONE]') {
                onComplete()
                return
              }
              // Add proper token spacing
              onToken(data + ' ')
            }
          }
        }
        onComplete()
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        onError(err)
      })

    return () => controller.abort()
  },
}
