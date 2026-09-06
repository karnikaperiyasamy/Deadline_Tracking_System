import { Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { CronService } from '../services/cron.service';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';
import { Status } from '@prisma/client';

export class NotificationController {
  static async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const data = await NotificationService.getUserNotifications(userId);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch notifications', 400);
    }
  }

  static async markRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const notificationId = req.params.id;
      const updated = await NotificationService.markAsRead(userId, notificationId);
      return sendSuccess(res, updated, 'Notification marked as read');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update notification', 400);
    }
  }

  static async markAllRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      await NotificationService.markAllAsRead(userId);
      return sendSuccess(res, null, 'All notifications marked as read');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to mark notifications as read', 400);
    }
  }

  static async sendTestEmailReminder(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          tasks: {
            where: { status: { in: [Status.TODO, Status.IN_PROGRESS] } },
            orderBy: { dueDate: 'asc' },
            take: 5,
          },
        },
      });

      if (!user) {
        return sendError(res, 'User account not found', 404);
      }

      await CronService.sendUserDigest(user.email, user.name, user.tasks);
      return sendSuccess(res, { emailSentTo: user.email }, `Test email reminder dispatched to ${user.email}`);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to send test email reminder', 500);
    }
  }
}
