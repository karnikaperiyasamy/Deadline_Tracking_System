import React from 'react';
import { TaskStatus, UrgencyLevel } from '../../types';
import { AlertCircle, Clock, Calendar, CheckCircle2 } from 'lucide-react';

interface UrgencyBadgeProps {
  dueDate: string;
  status: TaskStatus;
}

export function calculateUrgency(dueDateStr: string, status: TaskStatus): UrgencyLevel {
  if (status === 'COMPLETED' || status === 'CANCELLED') return 'FUTURE';

  const now = new Date();
  const due = new Date(dueDateStr);

  if (due.getTime() < now.getTime()) return 'OVERDUE';

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);

  if (due <= endOfToday) return 'DUE_TODAY';

  const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 3) return 'DUE_3_DAYS';
  if (diffDays <= 7) return 'DUE_7_DAYS';

  return 'FUTURE';
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ dueDate, status }) => {
  if (status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Completed
      </span>
    );
  }

  const urgency = calculateUrgency(dueDate, status);

  switch (urgency) {
    case 'OVERDUE':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          Overdue
        </span>
      );
    case 'DUE_TODAY':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          Due Today
        </span>
      );
    case 'DUE_3_DAYS':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/15 text-yellow-300 border border-yellow-500/20">
          <Clock className="w-3.5 h-3.5 text-yellow-400" />
          Due in &le;3d
        </span>
      );
    case 'DUE_7_DAYS':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/20">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          Due in &le;7d
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
          <Calendar className="w-3.5 h-3.5" />
          Upcoming
        </span>
      );
  }
};
