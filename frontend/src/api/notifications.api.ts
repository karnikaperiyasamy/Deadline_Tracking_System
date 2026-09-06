import { apiClient } from './apiClient';
import { ApiResponse, NotificationItem } from '../types';

export interface NotificationResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export const notificationsApi = {
  getNotifications: async (): Promise<NotificationResponse> => {
    const response = await apiClient.get<ApiResponse<NotificationResponse>>('/notifications');
    return response.data.data!;
  },

  markRead: async (id: string): Promise<NotificationItem> => {
    const response = await apiClient.patch<ApiResponse<NotificationItem>>(`/notifications/${id}/read`);
    return response.data.data!;
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },

  sendTestEmail: async (): Promise<{ emailSentTo: string }> => {
    const response = await apiClient.post<ApiResponse<{ emailSentTo: string }>>('/notifications/test-email');
    return response.data.data!;
  },
};
