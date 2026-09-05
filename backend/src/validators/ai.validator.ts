import { z } from 'zod';

export const aiChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  conversationId: z.string().optional(),
});

export const aiTaskBreakdownSchema = z.object({
  taskTitle: z.string().min(1, 'Task title required'),
  taskDescription: z.string().optional(),
  estimatedHours: z.number().optional(),
});

export const aiNaturalLanguageSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
});

export const aiRiskAnalysisSchema = z.object({
  taskId: z.string().min(1, 'Task ID required'),
});
