import { config } from '../config'
import { logger } from '../utils/logger'
import { cacheGet, cacheSet } from '../utils/cache'

export class AIService {
  private getFastApiUrl() {
    return config.FASTAPI_AI_URL
  }

  /**
   * Semantic job search via FastAPI embedding service.
   * Results are cached per query+job-set hash for 30s to avoid redundant inference.
   * Timeout: 5s (allows for FastAPI cold start).
   * Fallback: keyword-based scoring when AI service is unavailable.
   */
  async getSemanticSearch(query: string, jobs: any[]): Promise<{ jobId: string; score: number }[]> {
    // Cache key based on query + job IDs (not full job objects — too large)
    const jobIdsHash = jobs.map((j) => j.id).join(',')
    const cacheKey = `ai:semantic:${query}:${jobIdsHash}`
    const cached = cacheGet<{ jobId: string; score: number }[]>(cacheKey)
    if (cached) {
      logger.debug({ query }, 'AI semantic search cache hit')
      return cached
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s — allows for cold start

    try {
      const response = await fetch(`${this.getFastApiUrl()}/api/v1/search/semantic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, jobs }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`FastAPI responded with status: ${response.status}`)
      }

      const body = await response.json()
      const results = body.results.map((r: any) => ({
        jobId: r.jobId,
        score: r.semanticScore,
      }))

      // Cache for 30s — short enough to stay fresh, long enough to reduce load
      cacheSet(cacheKey, results, 30 * 1000)
      return results
    } catch (error) {
      clearTimeout(timeoutId)
      logger.warn(
        { err: error, query },
        'FastAPI AI semantic search failed. Falling back to local keyword matcher.'
      )

      return this._keywordFallback(query, jobs)
    }
  }

  private _keywordFallback(query: string, jobs: any[]): { jobId: string; score: number }[] {
    const queryLower = query.toLowerCase()
    const words = queryLower.split(/\s+/)

    return jobs.map((job) => {
      const text = `${job.title} ${job.description} ${job.skills.join(' ')}`.toLowerCase()
      let matchCount = 0
      for (const word of words) {
        if (text.includes(word)) matchCount++
      }
      const score = words.length > 0 ? Math.round((matchCount / words.length) * 100) : 0
      return { jobId: job.id, score }
    }).sort((a, b) => b.score - a.score)
  }

  /**
   * Match a candidate profile to a job list via FastAPI recommendation engine.
   * Results are cached per candidateId for 60s.
   * Timeout: 5s. Fallback: Jaccard skill similarity.
   */
  async matchCandidateToJobs(candidate: any, jobs: any[]): Promise<{ jobId: string; score: number }[]> {
    const cacheKey = `ai:match:${candidate.id}`
    const cached = cacheGet<{ jobId: string; score: number }[]>(cacheKey)
    if (cached) {
      logger.debug({ candidateId: candidate.id }, 'AI match recommendations cache hit')
      return cached
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(`${this.getFastApiUrl()}/api/v1/recommendations/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate, jobs }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`FastAPI responded with status: ${response.status}`)
      }

      const body = await response.json()
      const results = body.results.map((r: any) => ({
        jobId: r.jobId,
        score: r.overallScore,
      }))

      // Cache for 60s — candidate profiles don't change rapidly
      cacheSet(cacheKey, results, 60 * 1000)
      return results
    } catch (error) {
      clearTimeout(timeoutId)
      logger.warn(
        { err: error, candidateId: candidate.id },
        'FastAPI AI match recommendations failed. Falling back to local skills matching.'
      )

      return this._jaccardFallback(candidate, jobs)
    }
  }

  private _jaccardFallback(candidate: any, jobs: any[]): { jobId: string; score: number }[] {
    const candidateSkills = new Set(candidate.skills.map((s: string) => s.toLowerCase()))

    return jobs.map((job) => {
      const jobSkills = new Set(job.skills.map((s: string) => s.toLowerCase()))

      let intersection = 0
      for (const skill of candidateSkills) {
        if (jobSkills.has(skill)) intersection++
      }

      const union = new Set([...candidateSkills, ...jobSkills]).size
      const score = union > 0 ? Math.round((intersection / union) * 100) : 0
      return { jobId: job.id, score }
    }).sort((a, b) => b.score - a.score)
  }

  async parseResume(resumeText: string): Promise<any> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(`${this.getFastApiUrl()}/api/v1/resume/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: resumeText }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`FastAPI responded with status: ${response.status}`)
      }

      const body = await response.json()
      return body.parsed
    } catch (error) {
      clearTimeout(timeoutId)
      logger.warn(
        { err: error },
        'FastAPI AI resume parsing failed. Falling back to local regex parser.'
      )

      const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/)
      const email = emailMatch ? emailMatch[0] : ''

      const commonSkills = ['python', 'javascript', 'typescript', 'react', 'node.js', 'sql', 'docker', 'aws']
      const extractedSkills: string[] = []
      for (const skill of commonSkills) {
        if (new RegExp(`\\b${skill}\\b`, 'i').test(resumeText)) {
          extractedSkills.push(skill.toUpperCase())
        }
      }

      return {
        name: 'Extracted Candidate',
        email,
        headline: 'Software Engineer',
        bio: 'Self-motivated professional developer.',
        skills: extractedSkills,
        experience: [],
        education: [],
      }
    }
  }

  /**
   * Stream chat assistant responses via SSE.
   * Explicit 10s connection timeout to prevent hanging open connections.
   */
  async streamChatAssistant(message: string, context: any, res: any) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      logger.warn({ message }, 'Chat assistant stream timed out after 10s')
    }, 10000)

    try {
      const response = await fetch(`${this.getFastApiUrl()}/api/v1/chat/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`FastAPI responded with status: ${response.status}`)
      }

      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      if (response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          res.write(chunk)
        }
      }

      res.end()
    } catch (error) {
      clearTimeout(timeoutId)
      logger.error({ err: error }, 'FastAPI chat assistant connection failed. Triggering fallback.')
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/event-stream')
      }
      res.write('data: Sorry, my connection to the AI engine timed out. I will be back online shortly! \n\n')
      res.write('data: [DONE]\n\n')
      res.end()
    }
  }
}
export default AIService
