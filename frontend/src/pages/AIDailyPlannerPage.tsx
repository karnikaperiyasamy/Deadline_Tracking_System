import React, { useState, useEffect } from 'react';
import { aiApi } from '../api/ai.api';
import { DailyPlanResponse } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { CalendarDays, Sun, Sunrise, Sunset, Sparkles, RefreshCw } from 'lucide-react';

export const AIDailyPlannerPage: React.FC = () => {
  const [plan, setPlan] = useState<DailyPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPlan = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await aiApi.getDailyPlan();
      setPlan(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI Daily Plan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-400" />
            AI Daily Timeline Planner
          </h1>
          <p className="text-sm text-slate-400">
            Synthesizes your real PostgreSQL deadlines into an optimal, realistic daily schedule
          </p>
        </div>

        <button
          onClick={fetchPlan}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Re-Generate Plan
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Motivation Summary */}
          {plan?.summary && (
            <div className="p-4 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-2xl flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
              <p className="text-xs sm:text-sm text-slate-200 font-medium">{plan.summary}</p>
            </div>
          )}

          {/* Morning Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Sunrise className="w-5 h-5" />
              Morning Block (8:00 AM - 12:00 PM)
            </div>
            {plan?.morning && plan.morning.length > 0 ? (
              <div className="space-y-3">
                {plan.morning.map((t, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{t.taskName}</span>
                        <PriorityBadge priority={t.priority} />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{t.reason}</p>
                    </div>
                    <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 self-start sm:self-center">
                      Est. {t.estimatedHours} hrs
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No heavy tasks scheduled for morning.</p>
            )}
          </div>

          {/* Afternoon Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Sun className="w-5 h-5" />
              Afternoon Block (12:00 PM - 5:00 PM)
            </div>
            {plan?.afternoon && plan.afternoon.length > 0 ? (
              <div className="space-y-3">
                {plan.afternoon.map((t, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{t.taskName}</span>
                        <PriorityBadge priority={t.priority} />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{t.reason}</p>
                    </div>
                    <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 self-start sm:self-center">
                      Est. {t.estimatedHours} hrs
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No heavy tasks scheduled for afternoon.</p>
            )}
          </div>

          {/* Evening Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Sunset className="w-5 h-5" />
              Evening Block (5:00 PM - 9:00 PM)
            </div>
            {plan?.evening && plan.evening.length > 0 ? (
              <div className="space-y-3">
                {plan.evening.map((t, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{t.taskName}</span>
                        <PriorityBadge priority={t.priority} />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{t.reason}</p>
                    </div>
                    <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 self-start sm:self-center">
                      Est. {t.estimatedHours} hrs
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No heavy tasks scheduled for evening.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
