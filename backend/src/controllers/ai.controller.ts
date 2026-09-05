import { Response } from 'express';
import { AIService } from '../services/ai.service';
import { AuditService } from '../services/audit.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export class AIController {
  static async chat(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { message, conversationId } = req.body;
      const result = await AIService.chat(userId, message, conversationId);
      await AuditService.log(userId, 'AI_CHAT_REQUEST', { conversationId: result.conversationId });
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message || 'AI chat request failed', 400);
    }
  }

  static async generateDailyPlan(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const plan = await AIService.generateDailyPlan(userId);
      await AuditService.log(userId, 'AI_DAILY_PLAN_GENERATED');
      return sendSuccess(res, plan);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to generate AI daily plan', 400);
    }
  }

  static async taskBreakdown(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { taskTitle, taskDescription, estimatedHours } = req.body;
      const subtasks = await AIService.generateTaskBreakdown(userId, taskTitle, taskDescription, estimatedHours);
      await AuditService.log(userId, 'AI_TASK_BREAKDOWN', { taskTitle });
      return sendSuccess(res, subtasks);
    } catch (error: any) {
      return sendError(res, error.message || 'Task breakdown generation failed', 400);
    }
  }

  static async riskAnalysis(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { taskId } = req.body;
      const analysis = await AIService.analyzeDeadlineRisk(userId, taskId);
      await AuditService.log(userId, 'AI_RISK_ANALYSIS', { taskId });
      return sendSuccess(res, analysis);
    } catch (error: any) {
      return sendError(res, error.message || 'Risk analysis failed', 400);
    }
  }

  static async parseNaturalLanguage(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { prompt } = req.body;
      const parsedTask = await AIService.parseNaturalLanguageTask(userId, prompt);
      await AuditService.log(userId, 'AI_NL_TASK_PARSED', { prompt });
      return sendSuccess(res, parsedTask);
    } catch (error: any) {
      return sendError(res, error.message || 'Natural language parsing failed', 400);
    }
  }
}
