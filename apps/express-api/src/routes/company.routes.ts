import { Router } from 'express'
import { CompanyController } from '../controllers/company.controller'
import { validate } from '../middlewares/validation'
import { CompanySchema } from '@hireflow/schemas'
import { requireAuth, requireRole, requireOnboarded } from '../middlewares/auth'

const router = Router()
const controller = new CompanyController()

router.get('/', controller.listCompanies)
router.get('/:idOrSlug', controller.getCompany)
router.post('/', requireAuth, requireRole(['recruiter', 'admin']), requireOnboarded, validate({ body: CompanySchema }), controller.createCompany)
router.patch('/:id', requireAuth, requireRole(['recruiter', 'admin']), requireOnboarded, validate({ body: CompanySchema.partial() }), controller.updateCompany)
router.delete('/:id', requireAuth, requireRole(['recruiter', 'admin']), requireOnboarded, controller.deleteCompany)

export const companyRouter = router
export default companyRouter
