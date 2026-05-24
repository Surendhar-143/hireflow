import { Router } from 'express'
import { ApplicationController } from '../controllers/application.controller'
import { requireAuth, requireRole, requireOnboarded } from '../middlewares/auth'
import { requireOwnership } from '../middlewares/rbac'

const router = Router()
const controller = new ApplicationController()

router.post('/', requireAuth, requireRole(['candidate']), requireOnboarded, controller.submitApplication)
router.get('/:id', requireAuth, requireOnboarded, requireOwnership('application'), controller.getApplication)
router.patch('/:id/status', requireAuth, requireRole(['recruiter']), requireOnboarded, requireOwnership('application'), controller.updateStatus)
router.get('/job/:jobId', requireAuth, requireRole(['recruiter']), requireOnboarded, controller.listJobApplications)
router.get('/candidate/:candidateId', requireAuth, requireOnboarded, controller.listCandidateApplications)

export const applicationRouter = router
export default applicationRouter
