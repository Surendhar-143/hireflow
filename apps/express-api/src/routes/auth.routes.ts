import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { requireAuth } from '../middlewares/auth'

const router = Router()
const controller = new AuthController()

router.get('/me', requireAuth, controller.getMe)
router.post('/onboard', requireAuth, controller.onboard)

export const authRouter = router
export default authRouter
