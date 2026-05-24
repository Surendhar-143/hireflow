import { Request, Response, NextFunction } from 'express'
import { NotificationService } from '../services/notification.service'
import { prisma } from '../lib/prisma'
import { sendSuccess } from '../utils/response'
import { AppError } from '../errors/AppError'

const notificationService = new NotificationService()

export class NotificationController {
  async listNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      let userId = req.query.userId as string
      if (req.user) {
        userId = req.user.id
      }

      if (!userId) {
        throw new AppError('userId query parameter is required', 400)
      }

      const result = await notificationService.listNotifications(userId)
      return sendSuccess(res, result, 'Notifications list retrieved')
    } catch (error) {
      next(error)
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string
      if (!id) {
        throw new AppError('Notification ID parameter is required', 400)
      }

      // Check ownership
      const notification = await prisma.notification.findUnique({ where: { id } })
      if (!notification) {
        throw new AppError('Notification not found', 404)
      }

      if (req.user && notification.userId !== req.user.id) {
        throw new AppError('Forbidden: Access denied', 403)
      }

      const result = await notificationService.markAsRead(id)
      return sendSuccess(res, result, 'Notification marked as read')
    } catch (error) {
      next(error)
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      let { userId } = req.body
      if (req.user) {
        userId = req.user.id
      }

      if (!userId) {
        throw new AppError('userId is required in body', 400)
      }

      await notificationService.markAllAsRead(userId)
      return sendSuccess(res, null, 'All notifications marked as read')
    } catch (error) {
      next(error)
    }
  }
}
export default NotificationController
