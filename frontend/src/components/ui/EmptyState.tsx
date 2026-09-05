import React from 'react';
import { FolderPlus } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
      <div className="w-14 h-14 mb-4 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
        {icon || <FolderPlus className="w-7 h-7" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
