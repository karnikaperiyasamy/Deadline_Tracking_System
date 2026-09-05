import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '../../types';

const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  category: z.string(),
  priority: z.string(),
  status: z.string(),
  dueDate: z.string().min(1, 'Due date is required'),
  estimatedHours: z.number().min(0.1, 'Estimated hours must be > 0'),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Task>) => Promise<void>;
  initialData?: Task | null;
  title?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  title = 'Create New Task',
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'ASSIGNMENT',
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      estimatedHours: 2,
    },
  });

  useEffect(() => {
    if (initialData) {
      const formattedDate = new Date(initialData.dueDate).toISOString().slice(0, 16);
      reset({
        title: initialData.title,
        description: initialData.description || '',
        category: initialData.category,
        priority: initialData.priority,
        status: initialData.status,
        dueDate: formattedDate,
        estimatedHours: initialData.estimatedHours,
      });
    } else {
      reset({
        title: '',
        description: '',
        category: 'ASSIGNMENT',
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        estimatedHours: 2,
      });
    }
  }, [initialData, isOpen, reset]);

  const onSubmit = async (data: TaskFormData) => {
    const isoDueDate = new Date(data.dueDate).toISOString();
    await onSave({
      ...data,
      category: data.category as TaskCategory,
      priority: data.priority as TaskPriority,
      status: data.status as TaskStatus,
      dueDate: isoDueDate,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Task' : title}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Task Title *
          </label>
          <input
            {...register('title')}
            type="text"
            placeholder="e.g. Submit DBMS Assignment"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
          />
          {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Add relevant notes or requirements..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
            >
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              {...register('priority')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Due Date & Time *
            </label>
            <input
              {...register('dueDate')}
              type="datetime-local"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
            />
            {errors.dueDate && <p className="text-xs text-rose-400 mt-1">{errors.dueDate.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Estimated Hours
            </label>
            <input
              {...register('estimatedHours', { valueAsNumber: true })}
              type="number"
              step="0.5"
              min="0.5"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            {...register('status')}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
