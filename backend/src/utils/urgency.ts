import { Priority, Status, RiskLevel } from '@prisma/client';

export type UrgencyLevel = 'OVERDUE' | 'DUE_TODAY' | 'DUE_3_DAYS' | 'DUE_7_DAYS' | 'FUTURE';

export function calculateUrgency(dueDate: Date, status: Status): UrgencyLevel {
  if (status === Status.COMPLETED || status === Status.CANCELLED) {
    return 'FUTURE';
  }

  const now = new Date();
  const due = new Date(dueDate);

  if (due.getTime() < now.getTime()) {
    return 'OVERDUE';
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);

  if (due <= endOfToday) {
    return 'DUE_TODAY';
  }

  const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays <= 3) {
    return 'DUE_3_DAYS';
  }

  if (diffDays <= 7) {
    return 'DUE_7_DAYS';
  }

  return 'FUTURE';
}

export function calculateRiskLevel(
  dueDate: Date,
  estimatedHours: number,
  priority: Priority,
  status: Status
): RiskLevel {
  if (status === Status.COMPLETED || status === Status.CANCELLED) {
    return RiskLevel.LOW_RISK;
  }

  const now = new Date();
  const due = new Date(dueDate);
  const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours <= 0) {
    return RiskLevel.CRITICAL_RISK;
  }

  // Ratio of required effort to remaining available time window
  const ratio = estimatedHours / Math.max(diffHours, 1);

  if (diffHours < 24 || ratio > 0.5 || priority === Priority.CRITICAL) {
    if (diffHours < 12 || ratio > 0.8) {
      return RiskLevel.CRITICAL_RISK;
    }
    return RiskLevel.HIGH_RISK;
  }

  if (diffHours < 72 || ratio > 0.25 || priority === Priority.HIGH) {
    return RiskLevel.MEDIUM_RISK;
  }

  return RiskLevel.LOW_RISK;
}
