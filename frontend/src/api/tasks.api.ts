import { apiClient } from './apiClient';
import { ApiResponse, Task, TaskCategory, TaskPriority, TaskStatus } from '../types';

export interface TaskQueryParams {
  category?: TaskCategory;
  priority?: TaskPriority;
  status?: TaskStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
}

export const tasksApi = {
  getTasks: async (params?: TaskQueryParams): Promise<TaskListResponse> => {
    const response = await apiClient.get<ApiResponse<TaskListResponse>>('/tasks', { params });
    return response.data.data!;
  },

  getTaskById: async (id: string): Promise<Task> => {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data!;
  },

  createTask: async (data: Partial<Task>): Promise<Task> => {
    const response = await apiClient.post<ApiResponse<Task>>('/tasks', data);
    return response.data.data!;
  },

  batchCreateTasks: async (tasks: Partial<Task>[]): Promise<Task[]> => {
    const response = await apiClient.post<ApiResponse<Task[]>>('/tasks/batch', { tasks });
    return response.data.data!;
  },

  updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, data);
    return response.data.data!;
  },

  updateTaskStatus: async (id: string, status: TaskStatus): Promise<Task> => {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status });
    return response.data.data!;
  },

  markTaskComplete: async (id: string): Promise<Task> => {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}/complete`);
    return response.data.data!;
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },

  searchTasks: async (query: string): Promise<TaskListResponse> => {
    const response = await apiClient.get<ApiResponse<TaskListResponse>>('/search', { params: { q: query } });
    return response.data.data!;
  },
};
