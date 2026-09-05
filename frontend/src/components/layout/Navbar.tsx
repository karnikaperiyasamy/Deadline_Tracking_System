import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationsApi } from '../../api/notifications.api';
import { NotificationItem } from '../../types';
import {
  Bell,
  Search,
  Sparkles,
  User,
  LogOut,
  Settings as SettingsIcon,
  Menu,
  X,
  Clock,
  CheckCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenNLModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenNLModal }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (e) {
      // Silent error
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      // Silent
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/80 backdrop-blur-md border-b border-slate-800/80 light:border-slate-200/80 px-4 lg:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:rotate-6 group-hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight hidden sm:inline gradient-text-3d">
              LifeOS
            </span>
          </Link>
        </div>

        {/* Middle: Global Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Global Search (tasks, categories, notes)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </form>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2.5">
          {/* Light/Dark Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-900 dark:hover:bg-slate-900 light:hover:bg-slate-100 transition-all"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </button>

          {/* AI Quick Task Button */}
          <button
            onClick={onOpenNLModal}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span className="hidden sm:inline">AI Task</span>
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 text-xs transition-colors ${
                          n.read ? 'bg-transparent' : 'bg-blue-500/5'
                        }`}
                      >
                        <div className="font-semibold text-slate-200 mb-1 flex items-center justify-between">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-400">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-800 bg-slate-950/50 text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifMenu(false)}
                    className="text-xs text-blue-400 hover:underline font-medium"
                  >
                    View Inbox & History
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-900 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
              </div>
              <span className="text-sm font-medium text-slate-200 hidden md:inline">{user?.name}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in p-1.5">
                <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                  <p className="text-xs font-semibold text-slate-200">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  System Settings
                </Link>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors mt-1 border-t border-slate-800/60"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
