import { apiClient } from './apiClient';
import { ApiResponse, DashboardData, FullAnalyticsData } from '../types';

export const analyticsApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const response = await apiClient.get<ApiResponse<DashboardData>>('/analytics/dashboard');
    return response.data.data!;
  },

  getFullAnalytics: async (): Promise<FullAnalyticsData> => {
    const response = await apiClient.get<ApiResponse<FullAnalyticsData>>('/analytics/full');
    return response.data.data!;
  },
};
