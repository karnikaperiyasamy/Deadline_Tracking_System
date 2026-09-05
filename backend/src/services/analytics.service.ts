import { prisma } from '../config/prisma';
import { Status, Priority, Category } from '@prisma/client';
import { calculateUrgency } from '../utils/urgency';

export class AnalyticsService {
  static async getDashboardMetrics(userId: string) {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);

    const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

    let total = tasks.length;
    let pending = 0;
    let completed = 0;
    let overdue = 0;
    let dueToday = 0;
    let dueThisWeek = 0;
    let highPriority = 0;

    const statusCounts: Record<string, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    const categoryCounts: Record<string, number> = {};
    Object.values(Category || {}).forEach((cat: string) => (categoryCounts[cat] = 0));

    const priorityCounts: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    tasks.forEach((t: any) => {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
      priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;

      if (t.status === Status.COMPLETED) {
        completed++;
      } else if (t.status !== Status.CANCELLED) {
        pending++;
        const urgency = calculateUrgency(t.dueDate, t.status);
        if (urgency === 'OVERDUE') overdue++;
        if (t.dueDate >= startOfToday && t.dueDate <= endOfToday) dueToday++;
        if (t.dueDate >= startOfToday && t.dueDate <= endOfWeek) dueThisWeek++;
        if (t.priority === Priority.HIGH || t.priority === Priority.CRITICAL) highPriority++;
      }
    });

    const productivityScore = total > 0 ? Math.round((completed / total) * 100) : 100;

    const upcomingDeadlines = tasks
      .filter((t: any) => t.status !== Status.COMPLETED && t.status !== Status.CANCELLED)
      .slice(0, 5);

    return {
      overview: {
        total,
        pending,
        completed,
        overdue,
        dueToday,
        dueThisWeek,
        highPriority,
        productivityScore,
      },
      charts: {
        statusDistribution: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
        categoryDistribution: Object.entries(categoryCounts)
          .filter(([_, value]) => value > 0)
          .map(([name, value]) => ({ name, value })),
        priorityDistribution: Object.entries(priorityCounts).map(([name, value]) => ({ name, value })),
      },
      upcomingDeadlines,
    };
  }

  static async getFullAnalytics(userId: string) {
    const metrics = await this.getDashboardMetrics(userId);
    const tasks = await prisma.task.findMany({ where: { userId } });

    // Completion rate over last 7 days
    const last7Days: Record<string, { completed: number; created: number }> = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      last7Days[key] = { completed: 0, created: 0 };
    }

    tasks.forEach((t: any) => {
      const createdKey = t.createdAt.toISOString().split('T')[0];
      if (last7Days[createdKey]) {
        last7Days[createdKey].created++;
      }

      if (t.completedAt) {
        const completedKey = t.completedAt.toISOString().split('T')[0];
        if (last7Days[completedKey]) {
          last7Days[completedKey].completed++;
        }
      }
    });

    const completionTrend = Object.entries(last7Days).map(([date, counts]) => ({
      date,
      created: counts.created,
      completed: counts.completed,
    }));

    const totalEstHours = tasks.reduce((sum: number, t: any) => sum + t.estimatedHours, 0);
    const completedEstHours = tasks
      .filter((t: any) => t.status === Status.COMPLETED)
      .reduce((sum: number, t: any) => sum + t.estimatedHours, 0);

    return {
      ...metrics,
      analytics: {
        completionRate: metrics.overview.total > 0 ? Math.round((metrics.overview.completed / metrics.overview.total) * 100) : 0,
        overdueRate: metrics.overview.total > 0 ? Math.round((metrics.overview.overdue / metrics.overview.total) * 100) : 0,
        totalEstimatedHours: Math.round(totalEstHours * 10) / 10,
        completedEstimatedHours: Math.round(completedEstHours * 10) / 10,
        completionTrend,
      },
    };
  }
}
