import { apiClient } from './apiClient';
import { ApiResponse, UserSettings } from '../types';

export const settingsApi = {
  getSettings: async (): Promise<UserSettings> => {
    const response = await apiClient.get<ApiResponse<UserSettings>>('/settings');
    return response.data.data!;
  },

  updateSettings: async (data: Partial<UserSettings>): Promise<UserSettings> => {
    const response = await apiClient.put<ApiResponse<UserSettings>>('/settings', data);
    return response.data.data!;
  },
};
