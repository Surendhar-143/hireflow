import { Router } from 'express'
import { AdminController } from '../controllers/admin.controller'
import { requireAuth, requireRole } from '../middlewares/auth'

const router = Router()
const controller = new AdminController()

// All routes under admin scope are restricted to authenticated administrators
router.use(requireAuth)
router.use(requireRole(['admin']))

router.get('/logs', controller.getAuditLogs)
router.get('/candidates', controller.listCandidates)
router.post('/candidates/:id/toggle-visibility', controller.toggleCandidateVisibility)

export const adminRouter = router
export default adminRouter
