import { Router } from 'express'
import { NotificationController } from '../controllers/notification.controller'
import { requireAuth } from '../middlewares/auth'

const router = Router()
const controller = new NotificationController()

router.get('/', requireAuth, controller.listNotifications)
router.patch('/read-all', requireAuth, controller.markAllAsRead)
router.patch('/:id/read', requireAuth, controller.markAsRead)

export const notificationRouter = router
export default notificationRouter
