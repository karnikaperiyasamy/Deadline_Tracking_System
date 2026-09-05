import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { aiApi } from '../../api/ai.api';
import { tasksApi } from '../../api/tasks.api';
import { Task } from '../../types';

interface NLTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NLTaskModal: React.FC<NLTaskModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [prompt, setPrompt] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsParsing(true);
    setError('');
    setParsedResult(null);

    try {
      const result = await aiApi.parseNaturalLanguage(prompt);
      setParsedResult(result);
    } catch (err: any) {
      setError(err.message || 'AI parsing failed. Please try a clearer description.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!parsedResult) return;

    try {
      await tasksApi.createTask(parsedResult);
      onSuccess();
      onClose();
      setPrompt('');
      setParsedResult(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save task to database.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Quick Task Creator" maxWidth="max-w-xl">
      <div className="space-y-4">
        {!parsedResult ? (
          <form onSubmit={handleParse} className="space-y-4">
            <p className="text-sm text-slate-400">
              Type your deadline in plain conversational English. LifeOS AI will extract category, due date, estimated time, and priority.
            </p>

            <div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g. "Submit DBMS project report tomorrow at 6 PM"'
                rows={3}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {error && <p className="text-xs text-rose-400">{error}</p>}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isParsing || !prompt.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {isParsing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Parsing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Extract Task
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-2">
                <Sparkles className="w-4 h-4" />
                Extracted Task Details (Please Confirm)
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-400">Title:</span>{' '}
                  <span className="font-semibold text-slate-200">{parsedResult.title}</span>
                </div>
                {parsedResult.description && (
                  <div>
                    <span className="text-slate-400">Description:</span>{' '}
                    <span className="text-slate-300">{parsedResult.description}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-blue-500/20">
                  <div>
                    <span className="text-slate-400">Category:</span>{' '}
                    <span className="font-medium text-slate-200">{parsedResult.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Priority:</span>{' '}
                    <span className="font-medium text-slate-200">{parsedResult.priority}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Due Date:</span>{' '}
                    <span className="font-medium text-slate-200">
                      {new Date(parsedResult.dueDate).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Estimated Effort:</span>{' '}
                    <span className="font-medium text-slate-200">{parsedResult.estimatedHours} hrs</span>
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="text-xs text-rose-400">{error}</p>}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setParsedResult(null)}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Edit Prompt
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm & Save Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
