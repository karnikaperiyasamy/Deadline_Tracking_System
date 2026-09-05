import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tasksApi } from '../api/tasks.api';
import { aiApi } from '../api/ai.api';
import { Task, TaskCategory, TaskPriority, TaskStatus, RiskAnalysisResult } from '../types';
import { TaskModal } from '../components/tasks/TaskModal';
import { UrgencyBadge } from '../components/ui/UrgencyBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldAlert,
  Calendar,
  Tag,
  ArrowUpDown,
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState<string>(searchParams.get('category') || '');
  const [priority, setPriority] = useState<string>(searchParams.get('priority') || '');
  const [status, setStatus] = useState<string>(searchParams.get('status') || '');
  const [sortBy, setSortBy] = useState<string>('dueDate');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // AI Risk Modal State
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [analyzingTaskId, setAnalyzingTaskId] = useState<string | null>(null);
  const [riskResult, setRiskResult] = useState<RiskAnalysisResult | null>(null);
  const [riskLoading, setRiskLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await tasksApi.getTasks({
        search: search.trim() || undefined,
        category: (category as TaskCategory) || undefined,
        priority: (priority as TaskPriority) || undefined,
        status: (status as TaskStatus) || undefined,
        sortBy: sortBy || 'dueDate',
      });
      setTasks(res.tasks);
    } catch (e) {
      console.error('Failed to fetch tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, category, priority, status, sortBy]);

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await tasksApi.updateTask(editingTask.id, taskData);
    } else {
      await tasksApi.createTask(taskData);
    }
    setEditingTask(null);
    fetchTasks();
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this deadline?')) {
      await tasksApi.deleteTask(id);
      fetchTasks();
    }
  };

  const handleToggleComplete = async (id: string) => {
    await tasksApi.markTaskComplete(id);
    fetchTasks();
  };

  const handleAnalyzeRisk = async (task: Task) => {
    setAnalyzingTaskId(task.id);
    setRiskResult(null);
    setRiskModalOpen(true);
    setRiskLoading(true);

    try {
      const res = await aiApi.getRiskAnalysis(task.id);
      setRiskResult(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setRiskLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Deadline & Task Manager</h1>
          <p className="text-sm text-slate-400">Organized automatically by priority, status, and target date</p>
        </div>
        <button
          onClick={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Deadline
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            <option value="ASSIGNMENT">Assignment</option>
            <option value="EXAM">Exam</option>
            <option value="PROJECT">Project</option>
            <option value="HACKATHON">Hackathon</option>
            <option value="JOB">Job Application</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="SCHOLARSHIP">Scholarship</option>
            <option value="MEETING">Meeting</option>
            <option value="EVENT">Event</option>
            <option value="PERSONAL">Personal</option>
            <option value="OTHER">Other</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Task List Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No deadlines found"
          description="There are no tasks matching your filters. Create a new deadline to start organizing your schedule."
          actionLabel="Create Deadline"
          onAction={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 p-4 sm:p-5 rounded-2xl transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-bold text-base ${
                        task.status === 'COMPLETED' ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </span>
                    <CategoryBadge category={task.category} />
                    <PriorityBadge priority={task.priority} />
                    <UrgencyBadge dueDate={task.dueDate} status={task.status} />
                  </div>
                  {task.description && (
                    <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleAnalyzeRisk(task)}
                    className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    title="AI Risk Assessment"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Risk
                  </button>

                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className={`p-2 rounded-xl transition-colors ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                    title="Toggle Completion"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingTask(task);
                      setIsTaskModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Edit Task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-4">
                  <span>Due: {new Date(task.dueDate).toLocaleString()}</span>
                  <span>Estimated: {task.estimatedHours} hrs</span>
                </div>
                <span className="uppercase font-semibold tracking-wider text-slate-400">
                  Status: {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Edit/Create Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialData={editingTask}
      />

      {/* AI Risk Analysis Modal */}
      <Modal
        isOpen={riskModalOpen}
        onClose={() => setRiskModalOpen(false)}
        title="AI Deadline Risk Analysis"
      >
        {riskLoading ? (
          <div className="py-8 space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : riskResult ? (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Calculated Risk Evaluation
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {riskResult.riskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{riskResult.assessment}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Actionable Mitigations
              </h4>
              <ul className="space-y-1.5">
                {riskResult.recommendations.map((rec, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-xs text-rose-400">Failed to load risk analysis.</p>
        )}
      </Modal>
    </div>
  );
};
