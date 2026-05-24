import { Router } from 'express'
import { AIController } from '../controllers/ai.controller'
import { requireAuth } from '../middlewares/auth'

const router = Router()
const controller = new AIController()

router.post('/match', requireAuth, controller.matchJobs)
router.post('/parse-resume', controller.parseResume)
router.post('/search/hybrid', requireAuth, controller.searchHybrid)
router.post('/chat/assistant', requireAuth, controller.chatAssistant)

export const aiRouter = router
export default aiRouter

