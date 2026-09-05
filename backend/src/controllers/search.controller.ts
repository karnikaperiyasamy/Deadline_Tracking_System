import { Response } from 'express';
import { TaskService } from '../services/task.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export class SearchController {
  static async search(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const query = (req.query.q as string) || '';

      if (!query.trim()) {
        return sendSuccess(res, { tasks: [], total: 0 });
      }

      const results = await TaskService.getTasks(userId, {
        search: query,
        limit: 50,
      });

      return sendSuccess(res, results);
    } catch (error: any) {
      return sendError(res, error.message || 'Search failed', 400);
    }
  }
}
