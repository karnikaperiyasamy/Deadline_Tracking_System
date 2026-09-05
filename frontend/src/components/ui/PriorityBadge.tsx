import React from 'react';
import { TaskPriority } from '../../types';
import { ShieldAlert, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <ShieldAlert className="w-3 h-3 text-purple-400" />
          CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/20">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/20">
          <ArrowUpRight className="w-3 h-3 text-blue-400" />
          MEDIUM
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
          <ArrowDownRight className="w-3 h-3 text-slate-400" />
          LOW
        </span>
      );
  }
};
