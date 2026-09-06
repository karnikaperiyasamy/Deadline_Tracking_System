import { prisma } from '../config/prisma';
import { Status } from '@prisma/client';
import { EmailService } from './email.service';
import { logger } from '../utils/logger';

export class CronService {
  private static lastDigestDateStr: string = '';
  private static lastReminderCheckTime: number = 0;

  static initDailyCron() {
    logger.info('Initializing LifeOS Cron Scheduler (4:00 PM IST Work Digest & Deadline Reminders)...');

    // Run scheduler check every 1 minute
    setInterval(() => {
      this.checkAndSendDailyCron();
      this.checkAndSendDeadlineReminders();
    }, 60 * 1000);

    // Initial check on server boot
    setTimeout(() => {
      this.checkAndSendDeadlineReminders();
    }, 10 * 1000);
  }

  private static async checkAndSendDailyCron() {
    try {
      // Calculate IST time (Asia/Kolkata timezone)
      const now = new Date();
      const istTimeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });
      const [hourStr] = istTimeStr.split(':');
      const currentIstHour = parseInt(hourStr, 10);
      const currentDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

      // Trigger at 4:00 PM IST (16:00) once per calendar day
      if (currentIstHour === 16 && this.lastDigestDateStr !== currentDateStr) {
        this.lastDigestDateStr = currentDateStr;
        logger.info(`⏰ Triggering 4:00 PM IST Daily Work Digest for date: ${currentDateStr}`);
        await this.dispatchDailyWorkSummaries();
      }
    } catch (err) {
      logger.error('Error checking daily cron schedule:', err);
    }
  }

  private static async checkAndSendDeadlineReminders() {
    const nowMs = Date.now();
    // Run reminder check every 30 minutes
    if (nowMs - this.lastReminderCheckTime < 30 * 60 * 1000) return;
    this.lastReminderCheckTime = nowMs;

    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find tasks due in next 24 hours that are pending
      const urgentTasks = await prisma.task.findMany({
        where: {
          status: { in: [Status.TODO, Status.IN_PROGRESS] },
          dueDate: {
            gte: now,
            lte: in24Hours,
          },
        },
        include: {
          user: true,
        },
      });

      logger.info(`Checking deadline reminders: found ${urgentTasks.length} task(s) due within 24 hours.`);

      for (const task of urgentTasks) {
        if (!task.user || !task.user.email) continue;

        const hoursRemaining = Math.max(1, Math.round((task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)));
        const urgencyLabel = hoursRemaining <= 3 ? 'CRITICAL (Due in <3h)' : `HIGH (Due in ~${hoursRemaining}h)`;

        await EmailService.sendDeadlineAlert(
          task.user.email,
          task.user.name,
          task.title,
          task.dueDate,
          urgencyLabel
        );
      }
    } catch (err) {
      logger.error('Error dispatching deadline reminders:', err);
    }
  }

  static async dispatchDailyWorkSummaries() {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          tasks: {
            where: {
              status: { in: [Status.TODO, Status.IN_PROGRESS] },
            },
            select: {
              title: true,
              dueDate: true,
              priority: true,
            },
            orderBy: { dueDate: 'asc' },
            take: 5,
          },
        },
      });

      for (const user of users) {
        if (!user.email) continue;
        await this.sendUserDigest(user.email, user.name, user.tasks);
      }
    } catch (error) {
      logger.error('Failed to dispatch daily work summaries:', error);
    }
  }

  static async sendUserDigest(email: string, name: string, pendingTasks: any[]) {
    const taskCount = pendingTasks.length;
    let taskSummaryHtml = '';

    if (taskCount === 0) {
      taskSummaryHtml = `<p style="color: #10b981; font-weight: bold;">🎉 All tasks are currently completed! Excellent work.</p>`;
    } else {
      taskSummaryHtml =
        `<ul style="padding-left: 20px; color: #cbd5e1;">` +
        pendingTasks
          .map(
            (t) =>
              `<li style="margin-bottom: 8px;">
                <strong style="color: #f8fafc;">${t.title}</strong> — Due: ${new Date(t.dueDate).toLocaleString()} (${t.priority} Priority)
               </li>`
          )
          .join('') +
        `</ul>`;
    }

    return EmailService.sendDailyDigest(email, name, taskCount, taskSummaryHtml);
  }
}
