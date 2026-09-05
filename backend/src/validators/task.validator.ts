import { z } from 'zod';
import { Category, Priority, Status } from '@prisma/client';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().optional(),
  category: z.nativeEnum(Category).default(Category.OTHER),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  status: z.nativeEnum(Status).default(Status.TODO),
  dueDate: z.string().datetime({ message: 'dueDate must be a valid ISO datetime string' }),
  estimatedHours: z.number().min(0.1, 'Estimated hours must be at least 0.1').default(1),
});

export const updateTaskSchema = createTaskSchema.partial();

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(Status),
});

export const batchCreateTasksSchema = z.object({
  tasks: z.array(createTaskSchema),
});
