import { Response } from 'express';
import { TaskService } from '../services/task.service';
import { AuditService } from '../services/audit.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export class TaskController {
  static async createTask(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const task = await TaskService.createTask(userId, req.body);
      await AuditService.log(userId, 'TASK_CREATED', { taskId: task.id, title: task.title });
      return sendSuccess(res, task, 'Task created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create task', 400);
    }
  }

  static async batchCreateTasks(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { tasks } = req.body;
      const createdTasks = [];

      for (const t of tasks) {
        const created = await TaskService.createTask(userId, t);
        createdTasks.push(created);
      }

      await AuditService.log(userId, 'TASKS_BATCH_CREATED', { count: createdTasks.length });
      return sendSuccess(res, createdTasks, `${createdTasks.length} tasks created successfully`, 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to batch create tasks', 400);
    }
  }

  static async getTasks(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const result = await TaskService.getTasks(userId, req.query as any);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch tasks', 400);
    }
  }

  static async getTaskById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const taskId = req.params.id;
      const task = await TaskService.getTaskById(userId, taskId);
      return sendSuccess(res, task);
    } catch (error: any) {
      return sendError(res, error.message || 'Task not found', 404);
    }
  }

  static async updateTask(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const taskId = req.params.id;
      const task = await TaskService.updateTask(userId, taskId, req.body);
      await AuditService.log(userId, 'TASK_UPDATED', { taskId, title: task.title });
      return sendSuccess(res, task, 'Task updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update task', 400);
    }
  }

  static async deleteTask(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const taskId = req.params.id;
      await TaskService.deleteTask(userId, taskId);
      await AuditService.log(userId, 'TASK_DELETED', { taskId });
      return sendSuccess(res, null, 'Task deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete task', 400);
    }
  }

  static async updateTaskStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const taskId = req.params.id;
      const { status } = req.body;
      const task = await TaskService.updateTaskStatus(userId, taskId, status);
      await AuditService.log(userId, 'TASK_STATUS_CHANGED', { taskId, status });
      return sendSuccess(res, task, 'Task status updated');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update task status', 400);
    }
  }

  static async markTaskComplete(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const taskId = req.params.id;
      const task = await TaskService.markTaskComplete(userId, taskId);
      await AuditService.log(userId, 'TASK_COMPLETED', { taskId, title: task.title });
      return sendSuccess(res, task, 'Task marked as completed');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to complete task', 400);
    }
  }
}
