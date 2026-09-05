import { apiClient } from './apiClient';

export const healthApi = {
  checkHealth: async (): Promise<{ status: string; service: string }> => {
    const response = await apiClient.get<{ status: string; service: string }>('/health');
    return response.data;
  },
};
