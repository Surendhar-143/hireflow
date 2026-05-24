import { Router } from 'express'
import { CandidateController } from '../controllers/candidate.controller'
import { requireAuth, requireRole, requireOnboarded } from '../middlewares/auth'

const router = Router()
const controller = new CandidateController()

router.post('/saved', requireAuth, requireRole(['candidate']), requireOnboarded, controller.saveJob)
router.delete('/saved', requireAuth, requireRole(['candidate']), requireOnboarded, controller.unsaveJob)
router.get('/saved', requireAuth, requireRole(['candidate']), requireOnboarded, controller.listSavedJobs)
router.get('/profile/score/:candidateId', requireAuth, controller.getProfileScore)

export const candidateRouter = router
export default candidateRouter
