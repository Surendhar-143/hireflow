import { prisma } from '../lib/prisma'
import { AppError } from '../errors/AppError'

export class NotificationService {
  async createNotification(params: {
    userId: string
    title: string
    message: string
    type: string // "application_status" | "saved_alert" | "recommendation"
  }) {
    const { userId, title, message, type } = params

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new AppError('User not found', 404)
    }

    return prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    })
  }

  async listNotifications(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new AppError('User not found', 404)
    }

    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async markAsRead(id: string) {
    const notification = await prisma.notification.findUnique({ where: { id } })
    if (!notification) {
      throw new AppError('Notification not found', 404)
    }

    return prisma.notification.update({
      where: { id },
      data: { read: true },
    })
  }

  async markAllAsRead(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new AppError('User not found', 404)
    }

    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })
  }
}
export default NotificationService
