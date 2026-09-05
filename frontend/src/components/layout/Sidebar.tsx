import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Bot,
  CalendarDays,
  ListTree,
  BarChart3,
  Bell,
  User,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Deadlines & Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Calendar View', path: '/calendar', icon: Calendar },
    { label: 'AI Assistant', path: '/ai-chat', icon: Bot, isAi: true },
    { label: 'AI Daily Planner', path: '/ai-planner', icon: CalendarDays, isAi: true },
    { label: 'AI Task Breakdown', path: '/ai-breakdown', icon: ListTree, isAi: true },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 lg:z-30 h-full w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding for mobile */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-slate-100">LifeOS</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Core Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`
                }
              >
                <Icon className={`w-4 h-4 ${item.isAi ? 'text-indigo-400' : ''}`} />
                <span>{item.label}</span>
                {item.isAi && (
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px]">
            <p className="font-semibold text-slate-300 mb-0.5">LifeOS Engine v1.0</p>
            <p className="text-slate-500">PostgreSQL + AI Service Active</p>
          </div>
        </div>
      </aside>
    </>
  );
};
