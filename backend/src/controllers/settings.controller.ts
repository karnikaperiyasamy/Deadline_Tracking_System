import { Response } from 'express';
import { SettingsService } from '../services/settings.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export class SettingsController {
  static async getSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const settings = await SettingsService.getSettings(userId);
      return sendSuccess(res, settings);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch user settings', 400);
    }
  }

  static async updateSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const settings = await SettingsService.updateSettings(userId, req.body);
      return sendSuccess(res, settings, 'Settings updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update user settings', 400);
    }
  }
}
