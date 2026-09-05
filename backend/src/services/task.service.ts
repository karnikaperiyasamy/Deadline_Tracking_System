import { prisma } from '../config/prisma';
import { Category, Priority, Status, RiskLevel } from '@prisma/client';
import { calculateRiskLevel } from '../utils/urgency';

export interface TaskQueryFilters {
  category?: Category;
  priority?: Priority;
  status?: Status;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class TaskService {
  static async createTask(userId: string, data: {
    title: string;
    description?: string;
    category?: Category;
    priority?: Priority;
    status?: Status;
    dueDate: string | Date;
    estimatedHours?: number;
  }) {
    const dueDate = new Date(data.dueDate);
    const category = data.category || Category.OTHER;
    const priority = data.priority || Priority.MEDIUM;
    const status = data.status || Status.TODO;
    const estimatedHours = data.estimatedHours ?? 1;

    const riskLevel = calculateRiskLevel(dueDate, estimatedHours, priority, status);

    const task = await prisma.task.create({
      data: {
        userId,
        title: data.title,
        description: data.description || null,
        category,
        priority,
        status,
        dueDate,
        estimatedHours,
        riskLevel,
        completedAt: status === Status.COMPLETED ? new Date() : null,
      },
    });

    return task;
  }

  static async getTasks(userId: string, filters: TaskQueryFilters) {
    const {
      category,
      priority,
      status,
      search,
      startDate,
      endDate,
      sortBy = 'dueDate',
      sortOrder = 'asc',
      page = 1,
      limit = 100,
    } = filters;

    const where: any = { userId };

    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = new Date(startDate);
      if (endDate) where.dueDate.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    // Recalculate risk level dynamically on fetch
    const enrichedTasks = tasks.map((t: any) => ({
      ...t,
      riskLevel: calculateRiskLevel(t.dueDate, t.estimatedHours, t.priority, t.status),
    }));

    return {
      tasks: enrichedTasks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getTaskById(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new Error('Task not found or access denied.');
    }

    return {
      ...task,
      riskLevel: calculateRiskLevel(task.dueDate, task.estimatedHours, task.priority, task.status),
    };
  }

  static async updateTask(userId: string, taskId: string, data: any) {
    await this.getTaskById(userId, taskId); // Verify ownership

    const updateData: any = { ...data };
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    if (data.status === Status.COMPLETED) {
      updateData.completedAt = new Date();
    } else if (data.status && data.status !== Status.COMPLETED) {
      updateData.completedAt = null;
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    const riskLevel = calculateRiskLevel(task.dueDate, task.estimatedHours, task.priority, task.status);
    if (task.riskLevel !== riskLevel) {
      await prisma.task.update({
        where: { id: taskId },
        data: { riskLevel },
      });
    }

    return { ...task, riskLevel };
  }

  static async deleteTask(userId: string, taskId: string) {
    await this.getTaskById(userId, taskId); // Verify ownership
    await prisma.task.delete({ where: { id: taskId } });
    return { success: true };
  }

  static async updateTaskStatus(userId: string, taskId: string, status: Status) {
    return this.updateTask(userId, taskId, { status });
  }

  static async markTaskComplete(userId: string, taskId: string) {
    return this.updateTask(userId, taskId, { status: Status.COMPLETED });
  }
}
