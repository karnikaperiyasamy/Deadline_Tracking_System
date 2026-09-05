import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../api/analytics.api';
import { FullAnalyticsData } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { BarChart3, TrendingUp, CheckCircle2, Clock, AlertTriangle, Flame } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<FullAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getFullAnalytics();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  const analytics = data?.analytics;
  const overview = data?.overview;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          Productivity Analytics & Velocity
        </h1>
        <p className="text-sm text-slate-400">Database computed performance velocity metrics</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Completion Rate</span>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1">{analytics?.completionRate}%</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {overview?.completed} of {overview?.total} tasks completed
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Overdue Ratio</span>
          <p className="text-3xl font-extrabold text-rose-400 mt-1">{analytics?.overdueRate}%</p>
          <span className="text-[11px] text-slate-500 mt-1 block">{overview?.overdue} overdue items</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Est. Hours</span>
          <p className="text-3xl font-extrabold text-blue-400 mt-1">{analytics?.totalEstimatedHours}h</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {analytics?.completedEstimatedHours}h completed
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Productivity Score</span>
          <p className="text-3xl font-extrabold text-purple-400 mt-1">{overview?.productivityScore}%</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Real-time DB rating</span>
        </div>
      </div>

      {/* Completion Trend Chart */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          7-Day Completion Velocity Trend
        </h3>
        <div className="h-64 w-full">
          {analytics?.completionTrend && analytics.completionTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.completionTrend}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No recent trend activity logged
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
