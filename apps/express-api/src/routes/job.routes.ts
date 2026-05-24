import { Router } from 'express'
import { JobController } from '../controllers/job.controller'
import { validate } from '../middlewares/validation'
import { JobSchema } from '@hireflow/schemas'
import { requireAuth, requireRole, requireOnboarded } from '../middlewares/auth'

const router = Router()
const controller = new JobController()

router.get('/', controller.listJobs)
router.get('/:idOrSlug', controller.getJob)
router.post('/', requireAuth, requireRole(['recruiter']), requireOnboarded, validate({ body: JobSchema }), controller.createJob)
router.patch('/:id', requireAuth, requireRole(['recruiter']), requireOnboarded, validate({ body: JobSchema.partial() }), controller.updateJob)
router.delete('/:id', requireAuth, requireRole(['recruiter']), requireOnboarded, controller.deleteJob)

export const jobRouter = router
export default jobRouter
