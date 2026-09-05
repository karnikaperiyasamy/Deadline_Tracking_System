import { prisma } from '../config/prisma';
import { NotificationType, Status } from '@prisma/client';
import { calculateUrgency, calculateRiskLevel } from '../utils/urgency';
import { EmailService } from './email.service';

export class NotificationService {
  static async getUserNotifications(userId: string) {
    // Dynamically check tasks to trigger fresh notifications if needed
    await this.evaluateAndGenerateNotifications(userId);

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false },
    });

    return { notifications, unreadCount };
  }

  static async sendDailyRemindersToAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    for (const user of users) {
      await this.sendDailyReminderDigest(user.id, user.email, user.name);
    }

    return { success: true };
  }

  static async sendDailyReminderDigest(userId: string, email?: string, name?: string) {
    const user = email && name
      ? { email, name }
      : await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        });

    if (!user?.email) {
      return { success: false, reason: 'user_email_missing' };
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const alreadySentToday = await prisma.notification.findFirst({
      where: {
        userId,
        type: NotificationType.DEADLINE_APPROACHING,
        title: 'Daily Reminder Summary',
        createdAt: { gte: startOfDay },
      },
    });

    if (alreadySentToday) {
      return { success: false, reason: 'already_sent_today' };
    }

    const dueSoonTasks = await prisma.task.findMany({
      where: {
        userId,
        status: { in: [Status.TODO, Status.IN_PROGRESS] },
        dueDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { dueDate: 'asc' },
    });

    const reminderTasks = dueSoonTasks.filter((task) => {
      const urgency = calculateUrgency(task.dueDate, task.status);
      return urgency === 'OVERDUE' || urgency === 'DUE_TODAY' || urgency === 'DUE_3_DAYS' || urgency === 'DUE_7_DAYS';
    });

    if (reminderTasks.length === 0) {
      return { success: false, reason: 'no_due_tasks' };
    }

    const summaryText = reminderTasks
      .slice(0, 5)
      .map((task) => `${task.title} — ${task.dueDate.toLocaleDateString()} (${calculateUrgency(task.dueDate, task.status)})`)
      .join('; ');

    await this.createNotification(
      userId,
      'Daily Reminder Summary',
      `Daily reminder: ${summaryText}`,
      NotificationType.DEADLINE_APPROACHING
    );

    for (const task of reminderTasks) {
      await EmailService.sendDeadlineAlert(
        user.email,
        user.name,
        task.title,
        task.dueDate,
        calculateUrgency(task.dueDate, task.status)
      );
    }

    return { success: true, sentCount: reminderTasks.length };
  }

  static async markAsRead(userId: string, notificationId: string) {
    const notif = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notif) {
      throw new Error('Notification not found');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  static async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { success: true };
  }

  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType
  ) {
    return prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  }

  private static async evaluateAndGenerateNotifications(userId: string) {
    const now = new Date();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const activeTasks = await prisma.task.findMany({
      where: {
        userId,
        status: { in: [Status.TODO, Status.IN_PROGRESS] },
      },
    });

    for (const task of activeTasks) {
      const urgency = calculateUrgency(task.dueDate, task.status);
      const risk = calculateRiskLevel(task.dueDate, task.estimatedHours, task.priority, task.status);

      if (urgency === 'OVERDUE') {
        const exists = await prisma.notification.findFirst({
          where: {
            userId,
            type: NotificationType.OVERDUE_TASK,
            message: { contains: task.title },
          },
        });
        if (!exists) {
          await this.createNotification(
            userId,
            'Overdue Task Warning',
            `Task "${task.title}" was due on ${task.dueDate.toLocaleDateString()} and is now overdue!`,
            NotificationType.OVERDUE_TASK
          );

          // Dispatch real email alert to student
          await EmailService.sendDeadlineAlert(
            user.email,
            user.name,
            task.title,
            task.dueDate,
            'OVERDUE'
          );
        }
      } else if (urgency === 'DUE_TODAY') {
        const exists = await prisma.notification.findFirst({
          where: {
            userId,
            type: NotificationType.DEADLINE_APPROACHING,
            message: { contains: task.title },
          },
        });
        if (!exists) {
          await this.createNotification(
            userId,
            'Deadline Due Today',
            `Task "${task.title}" is due today at ${task.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            NotificationType.DEADLINE_APPROACHING
          );

          // Dispatch real email alert to student
          await EmailService.sendDeadlineAlert(
            user.email,
            user.name,
            task.title,
            task.dueDate,
            'DUE TODAY'
          );
        }
      }

      if (risk === 'CRITICAL_RISK') {
        const exists = await prisma.notification.findFirst({
          where: {
            userId,
            type: NotificationType.HIGH_RISK_DEADLINE,
            message: { contains: task.title },
          },
        });
        if (!exists) {
          await this.createNotification(
            userId,
            'Critical Deadline Risk',
            `Task "${task.title}" requires ${task.estimatedHours} estimated hours and is at CRITICAL RISK!`,
            NotificationType.HIGH_RISK_DEADLINE
          );

          // Dispatch high risk email alert
          await EmailService.sendHighRiskAlert(
            user.email,
            user.name,
            task.title,
            task.estimatedHours,
            'High required effort relative to remaining time window.'
          );
        }
      }
    }
  }
}
