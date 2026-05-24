import { config } from '../config'
import { logger } from '../utils/logger'

export class AIService {
  private getFastApiUrl() {
    return config.FASTAPI_AI_URL
  }

  async getSemanticSearch(query: string, jobs: any[]): Promise<{ jobId: string; score: number }[]> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

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
      return body.results.map((r: any) => ({
        jobId: r.jobId,
        score: r.semanticScore,
      }))
    } catch (error) {
      clearTimeout(timeoutId)
      logger.warn(
        { err: error, query },
        'FastAPI AI semantic search failed. Falling back to local keyword matcher.'
      )

      return jobs.map((job) => {
        const queryLower = query.toLowerCase()
        const text = `${job.title} ${job.description} ${job.skills.join(' ')}`.toLowerCase()
        
        const words = queryLower.split(/\s+/)
        let matchCount = 0
        for (const word of words) {
          if (text.includes(word)) matchCount++
        }

        const score = words.length > 0 ? Math.round((matchCount / words.length) * 100) : 0
        return { jobId: job.id, score }
      }).sort((a, b) => b.score - a.score)
    }
  }

  async matchCandidateToJobs(candidate: any, jobs: any[]): Promise<{ jobId: string; score: number }[]> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

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
      return body.results.map((r: any) => ({
        jobId: r.jobId,
        score: r.overallScore,
      }))
    } catch (error) {
      clearTimeout(timeoutId)
      logger.warn(
        { err: error, candidateId: candidate.id },
        'FastAPI AI match recommendations failed. Falling back to local skills matching.'
      )

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
  }

  async parseResume(resumeText: string): Promise<any> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

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
}
export default AIService
