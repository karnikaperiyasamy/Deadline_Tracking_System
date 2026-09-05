import { apiClient } from './apiClient';
import { ApiResponse, User } from '../types';

export const profileApi = {
  updateProfile: async (data: { name: string }): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>('/profile', data);
    return response.data.data!;
  },

  updatePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await apiClient.put('/profile/password', data);
  },
};
