import { Router } from 'express'
import { RecruiterController } from '../controllers/recruiter.controller'
import { requireAuth, requireRole, requireOnboarded } from '../middlewares/auth'

const router = Router()
const controller = new RecruiterController()

router.get('/analytics', requireAuth, requireRole(['recruiter']), requireOnboarded, controller.getAnalytics)
router.get('/pipeline/:jobId', requireAuth, requireRole(['recruiter']), requireOnboarded, controller.getPipeline)

export const recruiterRouter = router
export default recruiterRouter
