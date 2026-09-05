import React, { useState, useEffect } from 'react';
import { notificationsApi } from '../api/notifications.api';
import { NotificationItem } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { Bell, CheckCheck, AlertCircle, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    fetchNotifications();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-400" />
            Notification Center
          </h1>
          <p className="text-sm text-slate-400">Automated system alerts, approaching deadlines, and AI insights</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs font-bold rounded-xl border border-blue-500/30 transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/30 text-slate-500 text-sm">
          Your inbox is completely clear. No notifications.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                n.read
                  ? 'bg-slate-900/40 border-slate-800/60'
                  : 'bg-slate-900/90 border-blue-500/30 ring-1 ring-blue-500/20'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100">{n.title}</span>
                  {!n.read && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white uppercase">
                      New
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">{n.message}</p>
                <span className="text-[10px] text-slate-500 block">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors self-end sm:self-center shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
