import { Router } from 'express'
import { AIController } from '../controllers/ai.controller'
import { requireAuth } from '../middlewares/auth'

const router = Router()
const controller = new AIController()

router.post('/match', requireAuth, controller.matchJobs)
router.post('/parse-resume', controller.parseResume)

export const aiRouter = router
export default aiRouter
