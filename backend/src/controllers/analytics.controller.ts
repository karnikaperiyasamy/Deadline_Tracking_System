import { Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export class AnalyticsController {
  static async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const data = await AnalyticsService.getDashboardMetrics(userId);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch dashboard analytics', 400);
    }
  }

  static async getFullAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const data = await AnalyticsService.getFullAnalytics(userId);
      return sendSuccess(res, data);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch full analytics', 400);
    }
  }
}
