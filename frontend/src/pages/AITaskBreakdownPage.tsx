import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiApi } from '../api/ai.api';
import { tasksApi } from '../api/tasks.api';
import { TaskBreakdownItem } from '../types';
import { ListTree, Sparkles, Plus, CheckCircle2, ArrowRight } from 'lucide-react';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { Skeleton } from '../components/ui/Skeleton';

export const AITaskBreakdownPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(10);

  const [isGenerating, setIsGenerating] = useState(false);
  const [subtasks, setSubtasks] = useState<TaskBreakdownItem[]>([]);
  const [error, setError] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsGenerating(true);
    setError('');
    setSubtasks([]);

    try {
      const res = await aiApi.getTaskBreakdown(title, description, estimatedHours);
      setSubtasks(res);
    } catch (err: any) {
      setError(err.message || 'AI Task breakdown failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBatchSaveToDatabase = async () => {
    if (subtasks.length === 0) return;

    setIsSaving(true);
    try {
      const now = new Date();
      const preparedTasks = subtasks.map((st) => {
        const dueDate = new Date(now.getTime() + (st.daysFromNow || 1) * 24 * 60 * 60 * 1000);
        return {
          title: st.title,
          description: st.description || `Subtask generated for objective: ${title}`,
          category: st.category,
          priority: st.priority,
          status: 'TODO' as any,
          dueDate: dueDate.toISOString(),
          estimatedHours: st.estimatedHours || 1.5,
        };
      });

      await tasksApi.batchCreateTasks(preparedTasks);
      navigate('/tasks');
    } catch (err: any) {
      setError(err.message || 'Failed to save subtasks to database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <ListTree className="w-6 h-6 text-purple-400" />
          AI Goal & Task Decomposer
        </h1>
        <p className="text-sm text-slate-400">
          Transform major projects into bite-sized, actionable deadlines with 1-click database commit
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Major Objective Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build my Final Year Software Project"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Context / Details (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Target tech stack, requirements, or scope..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Total Target Hours
              </label>
              <input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isGenerating || !title.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Decomposing Goal...' : 'Generate Actionable Subtasks'}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Subtasks Preview */}
      {isGenerating ? (
        <div className="space-y-3">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs">
          {error}
        </div>
      ) : subtasks.length > 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Generated Subtask Plan ({subtasks.length} subtasks)
              </h3>
              <p className="text-xs text-slate-400">Review subtasks before confirming database commit</p>
            </div>
            <button
              onClick={handleBatchSaveToDatabase}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSaving ? 'Inserting to PostgreSQL...' : 'Confirm & Save All Subtasks'}
            </button>
          </div>

          <div className="space-y-3">
            {subtasks.map((st, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{st.title}</span>
                    <CategoryBadge category={st.category} />
                    <PriorityBadge priority={st.priority} />
                  </div>
                  {st.description && <p className="text-xs text-slate-400">{st.description}</p>}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-3 shrink-0">
                  <span>Target: +{st.daysFromNow} days</span>
                  <span>Est: {st.estimatedHours} hrs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
