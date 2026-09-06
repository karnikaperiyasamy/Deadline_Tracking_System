import { prisma } from '../config/prisma';
import { Status } from '@prisma/client';
import { EmailService } from './email.service';
import { logger } from '../utils/logger';

export class CronService {
  private static lastRunDateStr: string = '';

  static initDailyCron() {
    logger.info('Initializing Daily 4:00 PM Work Alert Scheduler...');

    // Run check every 5 minutes and unref timer to avoid memory leaks
    const timer = setInterval(() => {
      this.checkAndSend4PMCron();
    }, 5 * 60 * 1000);

    if (timer.unref) {
      timer.unref();
    }
  }

  private static async checkAndSend4PMCron() {
    const now = new Date();
    const currentHours = now.getHours();
    const currentDateStr = now.toISOString().split('T')[0];

    // Trigger at 4:00 PM (16:00) once per calendar day
    if (currentHours === 16 && this.lastRunDateStr !== currentDateStr) {
      this.lastRunDateStr = currentDateStr;
      logger.info(`⏰ Triggering 4:00 PM Daily Student Work Digest for date: ${currentDateStr}`);
      await this.dispatchDailyWorkSummaries();
    }
  }

  static async dispatchDailyWorkSummaries() {
    try {
      const users = await prisma.user.findMany({
        select: {
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

        const pendingTasks = user.tasks;
        const taskCount = pendingTasks.length;

        let taskSummaryHtml = '';
        if (taskCount === 0) {
          taskSummaryHtml = `<p style="color: #10b981; font-weight: bold;">🎉 All tasks are currently completed! Excellent work.</p>`;
        } else {
          taskSummaryHtml = `<ul style="padding-left: 20px; color: #cbd5e1;">` +
            pendingTasks.map((t) => 
              `<li style="margin-bottom: 8px;">
                <strong>${t.title}</strong> — Due: ${t.dueDate.toLocaleString()} (${t.priority} Priority)
               </li>`
            ).join('') +
            `</ul>`;
        }

        await EmailService.sendDailyDigest(
          user.email,
          user.name,
          taskCount,
          taskSummaryHtml
        );
      }
    } catch (error) {
      logger.error('Failed to dispatch 4:00 PM daily work summaries:', error);
    }
  }
}
