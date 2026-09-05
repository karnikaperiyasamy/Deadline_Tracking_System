import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../api/analytics.api';
import { aiApi } from '../api/ai.api';
import { tasksApi } from '../api/tasks.api';
import { DashboardData, Task } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { UrgencyBadge } from '../components/ui/UrgencyBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { TaskModal } from '../components/tasks/TaskModal';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Flame,
  CalendarDays,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Link } from 'react-router-dom';

const STATUS_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#64748b'];

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [aiAdviceLoading, setAiAdviceLoading] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiAdvice = async () => {
    setAiAdviceLoading(true);
    try {
      const res = await aiApi.chat('Give me a 2-sentence priority strategy recommendation for today based on my active tasks.');
      setAiAdvice(res.reply);
    } catch (e: any) {
      setAiAdvice(e.message || 'AI service not configured.');
    } finally {
      setAiAdviceLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAiAdvice();
  }, []);

  const handleCreateTask = async (taskData: Partial<Task>) => {
    await tasksApi.createTask(taskData);
    fetchDashboardData();
  };

  const handleToggleComplete = async (taskId: string) => {
    await tasksApi.markTaskComplete(taskId);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
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

  const overview = data?.overview;

  return (
    <div className="space-y-8 animate-fade-in perspective-1000">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight gradient-text-3d">
            Command Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            AI-Powered Deadline Management Engine & Real-Time Analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Deadline
          </button>
        </div>
      </div>

      {/* 3D Interactive Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card-glow border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden card-3d-hover group">
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-100">{overview?.total ?? 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">
            {overview?.completed ?? 0} Completed ({overview?.productivityScore}% score)
          </span>
        </div>

        <div className="glass-card-glow border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden card-3d-hover group">
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Overdue Risk</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-400">{overview?.overdue ?? 0}</p>
          <span className="text-[11px] text-rose-400/80 mt-1 inline-block font-medium">Requires immediate action</span>
        </div>

        <div className="glass-card-glow border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden card-3d-hover group">
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Due Today</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-400">{overview?.dueToday ?? 0}</p>
          <span className="text-[11px] text-amber-400/80 mt-1 inline-block font-medium">
            {overview?.dueThisWeek ?? 0} due this week
          </span>
        </div>

        <div className="glass-card-glow border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden card-3d-hover group">
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Productivity</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400">{overview?.productivityScore ?? 100}%</p>
          <span className="text-[11px] text-emerald-400/80 mt-1 inline-block font-medium">Calculated velocity rate</span>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-purple-950/60 border border-blue-500/30 rounded-3xl space-y-3 relative overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-blue-400 font-extrabold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            AI Executive Assistant Strategy Recommendation
          </div>
          <button
            onClick={fetchAiAdvice}
            disabled={aiAdviceLoading}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline disabled:opacity-50"
          >
            {aiAdviceLoading ? 'Analyzing DB...' : 'Refresh AI Strategy'}
          </button>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          {aiAdvice || 'Loading AI strategy recommendations...'}
        </p>
      </div>

      {/* Recharts Analytics Distribution */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-panel-3d p-6 rounded-3xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Task Status Breakdown
          </h3>
          <div className="h-60 w-full">
            {data?.charts.statusDistribution && data.charts.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.charts.statusDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No tasks available for status distribution
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel-3d p-6 rounded-3xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Category Distribution
          </h3>
          <div className="h-60 w-full">
            {data?.charts.categoryDistribution && data.charts.categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.categoryDistribution}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No categories populated yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming High-Urgency Deadlines Table */}
      <div className="glass-panel-3d rounded-3xl overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-100">Upcoming Deadlines</h3>
            <p className="text-xs text-slate-400">Real-time database task queue</p>
          </div>
          <Link
            to="/tasks"
            className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1"
          >
            View All Tasks
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data?.upcomingDeadlines && data.upcomingDeadlines.length > 0 ? (
          <div className="divide-y divide-slate-800/80">
            {data.upcomingDeadlines.map((task) => (
              <div
                key={task.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 px-3 rounded-2xl transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-100">{task.title}</span>
                    <CategoryBadge category={task.category} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-3">
                    <span>Due: {new Date(task.dueDate).toLocaleString()}</span>
                    <span>• {task.estimatedHours} hrs est.</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <UrgencyBadge dueDate={task.dueDate} status={task.status} />
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors text-xs font-medium flex items-center gap-1"
                    title="Mark Complete"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            No upcoming deadlines found. You are completely caught up!
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleCreateTask}
      />
    </div>
  );
};
