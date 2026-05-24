import { Router } from 'express'
import { SearchController } from '../controllers/search.controller'
import { validate } from '../middlewares/validation'
import { SearchSchema } from '@hireflow/schemas'

const router = Router()
const controller = new SearchController()

// GET /api/v1/search?q=...&type=all&limit=10
router.get('/', validate({ query: SearchSchema }), controller.search)

export const searchRouter = router
export default searchRouter
