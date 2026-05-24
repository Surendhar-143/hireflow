import { Request, Response, NextFunction } from 'express'
import { SearchService } from '../services/search.service'
import { sendSuccess } from '../utils/response'

const searchService = new SearchService()

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string
      const type = (req.query.type as 'jobs' | 'companies' | 'all') || 'all'
      const limit = parseInt(req.query.limit as string, 10) || 10

      const result = await searchService.search({ q, type, limit })

      return sendSuccess(res, result, 'Search completed', 200, {
        took: result.took,
        total: result.total,
      })
    } catch (error) {
      next(error)
    }
  }
}

export default SearchController
