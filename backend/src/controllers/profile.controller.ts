import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuditService } from '../services/audit.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export class ProfileController {
  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { name } = req.body;
      const updated = await AuthService.updateProfile(userId, name);
      await AuditService.log(userId, 'PROFILE_UPDATED', { name });
      return sendSuccess(res, updated, 'Profile updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update profile', 400);
    }
  }

  static async updatePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;
      await AuthService.updatePassword(userId, currentPassword, newPassword);
      await AuditService.log(userId, 'PASSWORD_CHANGED');
      return sendSuccess(res, null, 'Password updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update password', 400);
    }
  }
}
