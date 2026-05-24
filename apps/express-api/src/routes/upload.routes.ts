import { Router } from 'express'
import { UploadController } from '../controllers/upload.controller'
import { requireAuth } from '../middlewares/auth'

const router = Router()
const controller = new UploadController()

router.post('/sign', requireAuth, controller.getSignedUrl)

export const uploadRouter = router
export default uploadRouter
