import { Router } from 'express'
import { ApplicationController } from '../controllers/application.controller'
import { requireAuth, requireRole, requireOnboarded } from '../middlewares/auth'

const router = Router()
const controller = new ApplicationController()

router.post('/', requireAuth, requireRole(['candidate']), requireOnboarded, controller.submitApplication)
router.get('/:id', requireAuth, requireOnboarded, controller.getApplication)
router.patch('/:id/status', requireAuth, requireRole(['recruiter']), requireOnboarded, controller.updateStatus)
router.get('/job/:jobId', requireAuth, requireRole(['recruiter']), requireOnboarded, controller.listJobApplications)
router.get('/candidate/:candidateId', requireAuth, requireOnboarded, controller.listCandidateApplications)

export const applicationRouter = router
export default applicationRouter
