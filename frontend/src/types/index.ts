export type TaskCategory =
  | 'ASSIGNMENT'
  | 'EXAM'
  | 'PROJECT'
  | 'HACKATHON'
  | 'JOB'
  | 'INTERNSHIP'
  | 'SCHOLARSHIP'
  | 'MEETING'
  | 'EVENT'
  | 'PERSONAL'
  | 'OTHER';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type TaskRiskLevel = 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'CRITICAL_RISK';

export type UrgencyLevel = 'OVERDUE' | 'DUE_TODAY' | 'DUE_3_DAYS' | 'DUE_7_DAYS' | 'FUTURE';

export type NotificationType =
  | 'DEADLINE_APPROACHING'
  | 'OVERDUE_TASK'
  | 'TASK_COMPLETED'
  | 'HIGH_RISK_DEADLINE'
  | 'AI_RECOMMENDATION';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
  settings?: UserSettings;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: string;
  timezone: string;
  notificationEmail: boolean;
  aiPreferences: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  estimatedHours: number;
  completedAt?: string | null;
  riskLevel: TaskRiskLevel;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardOverview {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  highPriority: number;
  productivityScore: number;
}

export interface DistributionItem {
  name: string;
  value: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  charts: {
    statusDistribution: DistributionItem[];
    categoryDistribution: DistributionItem[];
    priorityDistribution: DistributionItem[];
  };
  upcomingDeadlines: Task[];
}

export interface FullAnalyticsData extends DashboardData {
  analytics: {
    completionRate: number;
    overdueRate: number;
    totalEstimatedHours: number;
    completedEstimatedHours: number;
    completionTrend: Array<{
      date: string;
      created: number;
      completed: number;
    }>;
  };
}

export interface DailyPlanTask {
  taskName: string;
  estimatedHours: number;
  priority: TaskPriority;
  reason: string;
}

export interface DailyPlanResponse {
  summary: string;
  morning: DailyPlanTask[];
  afternoon: DailyPlanTask[];
  evening: DailyPlanTask[];
}

export interface TaskBreakdownItem {
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  estimatedHours: number;
  daysFromNow: number;
}

export interface RiskAnalysisResult {
  riskLevel: TaskRiskLevel;
  assessment: string;
  recommendations: string[];
}
