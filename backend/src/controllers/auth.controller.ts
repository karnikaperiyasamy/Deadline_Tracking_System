import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuditService } from '../services/audit.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export class AuthController {
  static async register(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.register(name, email, password);

      await AuditService.log(null, 'USER_OTP_DISPATCHED', { email }, req.ip, req.headers['user-agent']);

      return sendSuccess(res, result, 'Verification OTP sent to your email address', 200);
    } catch (error: any) {
      if (error.code && (error.code.startsWith('P100') || error.code === 'P1012')) {
        return sendError(
          res,
          'Database Connection Failure: Could not connect to PostgreSQL database. Please set a valid DATABASE_URL in backend/.env.',
          500,
          'DATABASE_CONNECTION_ERROR'
        );
      }
      return sendError(res, error.message || 'Registration failed', 400);
    }
  }

  static async verifyOTP(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, code } = req.body;
      const result = await AuthService.verifyRegistration(email, code);

      await AuditService.log(result.user.id, 'USER_REGISTERED', { email }, req.ip, req.headers['user-agent']);

      return sendSuccess(res, result, 'Registration verified and account created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'OTP Verification failed', 400);
    }
  }

  static async resendOTP(req: AuthenticatedRequest, res: Response) {
    try {
      const { email } = req.body;
      const result = await AuthService.resendRegistrationOtp(email);

      return sendSuccess(res, result, 'New verification OTP sent to email');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to resend OTP', 400);
    }
  }

  static async login(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      await AuditService.log(result.user.id, 'USER_LOGGED_IN', { email }, req.ip, req.headers['user-agent']);

      return sendSuccess(res, result, 'Login successful');
    } catch (error: any) {
      if (error.code && (error.code.startsWith('P100') || error.code === 'P1012')) {
        return sendError(
          res,
          'Database Connection Failure: Could not connect to PostgreSQL database. Please set a valid DATABASE_URL in backend/.env.',
          500,
          'DATABASE_CONNECTION_ERROR'
        );
      }
      return sendError(res, error.message || 'Authentication failed', 401);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const user = await AuthService.getUserProfile(userId);
      return sendSuccess(res, user, 'Profile retrieved');
    } catch (error: any) {
      if (error.code && (error.code.startsWith('P100') || error.code === 'P1012')) {
        return sendError(
          res,
          'Database Connection Failure: Could not connect to PostgreSQL database. Please set a valid DATABASE_URL in backend/.env.',
          500,
          'DATABASE_CONNECTION_ERROR'
        );
      }
      return sendError(res, error.message || 'User profile not found', 404);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response) {
    if (req.user?.userId) {
      await AuditService.log(req.user.userId, 'USER_LOGGED_OUT', {}, req.ip, req.headers['user-agent']);
    }
    return sendSuccess(res, null, 'Logged out successfully');
  }
}
