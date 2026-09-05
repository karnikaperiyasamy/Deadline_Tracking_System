import { apiClient } from './apiClient';
import { ApiResponse, DailyPlanResponse, TaskBreakdownItem, RiskAnalysisResult } from '../types';

export const aiApi = {
  chat: async (message: string, conversationId?: string): Promise<{ conversationId: string; reply: string }> => {
    const response = await apiClient.post<ApiResponse<{ conversationId: string; reply: string }>>('/ai/chat', {
      message,
      conversationId,
    });
    return response.data.data!;
  },

  getDailyPlan: async (): Promise<DailyPlanResponse> => {
    const response = await apiClient.post<ApiResponse<DailyPlanResponse>>('/ai/daily-plan');
    return response.data.data!;
  },

  getTaskBreakdown: async (taskTitle: string, taskDescription?: string, estimatedHours?: number): Promise<TaskBreakdownItem[]> => {
    const response = await apiClient.post<ApiResponse<TaskBreakdownItem[]>>('/ai/task-breakdown', {
      taskTitle,
      taskDescription,
      estimatedHours,
    });
    return response.data.data!;
  },

  getRiskAnalysis: async (taskId: string): Promise<RiskAnalysisResult> => {
    const response = await apiClient.post<ApiResponse<RiskAnalysisResult>>('/ai/risk-analysis', { taskId });
    return response.data.data!;
  },

  parseNaturalLanguage: async (prompt: string): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>('/ai/parse-nl', { prompt });
    return response.data.data!;
  },
};
