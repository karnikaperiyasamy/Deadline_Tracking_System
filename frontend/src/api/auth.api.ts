import { apiClient } from './apiClient';
import { ApiResponse, User } from '../types';

export interface AuthResponseData {
  user: User;
  token: string;
}

export interface RegistrationPendingData {
  email: string;
  expiresAt: string;
}

export const authApi = {
  register: async (data: { name: string; email: string; password: string }): Promise<RegistrationPendingData> => {
    const response = await apiClient.post<ApiResponse<RegistrationPendingData>>('/auth/register', data);
    return response.data.data!;
  },

  verifyRegistration: async (data: { email: string; code: string }): Promise<AuthResponseData> => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/verify-otp', data);
    return response.data.data!;
  },

  resendRegistrationOtp: async (email: string): Promise<RegistrationPendingData> => {
    const response = await apiClient.post<ApiResponse<RegistrationPendingData>>('/auth/resend-otp', { email });
    return response.data.data!;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponseData> => {
    const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', data);
    return response.data.data!;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
