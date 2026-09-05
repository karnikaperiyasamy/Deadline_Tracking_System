import React, { useState, useEffect } from 'react';
import { tasksApi } from '../api/tasks.api';
import { Task } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { UrgencyBadge } from '../components/ui/UrgencyBadge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await tasksApi.getTasks({ limit: 300 });
      setTasks(res.tasks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  // Calendar Helper functions
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getTasksForDate = (dayNum: number) => {
    return tasks.filter((t) => {
      const d = new Date(t.dueDate);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === dayNum;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Deadline Calendar</h1>
          <p className="text-sm text-slate-400">Visual date grid synchronized with PostgreSQL</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'month' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'week' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'day' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Day
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-200 px-3">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <Skeleton className="h-96 w-full rounded-3xl" />
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-800">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {paddingDays.map((_, idx) => (
              <div key={`pad-${idx}`} className="h-28 bg-slate-950/20 rounded-xl border border-transparent" />
            ))}

            {daysArray.map((dayNum) => {
              const dayTasks = getTasksForDate(dayNum);
              const isToday =
                new Date().getDate() === dayNum &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={dayNum}
                  className={`h-28 p-2 bg-slate-950/60 rounded-xl border transition-colors flex flex-col justify-between overflow-hidden ${
                    isToday ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center'
                          : 'text-slate-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-semibold">{dayTasks.length} tasks</span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-20">
                    {dayTasks.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTask(t)}
                        className="w-full text-left px-1.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors text-[10px] font-semibold text-blue-300 truncate block"
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Deadline Specifications"
      >
        {selectedTask && (
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-100">{selectedTask.title}</h3>
              <div className="flex gap-2 flex-wrap">
                <CategoryBadge category={selectedTask.category} />
                <PriorityBadge priority={selectedTask.priority} />
                <UrgencyBadge dueDate={selectedTask.dueDate} status={selectedTask.status} />
              </div>
            </div>

            {selectedTask.description && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
                {selectedTask.description}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 text-slate-400">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Target Due Date
                </span>
                <span className="text-slate-200 font-medium">{new Date(selectedTask.dueDate).toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Estimated Effort
                </span>
                <span className="text-slate-200 font-medium">{selectedTask.estimatedHours} hours</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
