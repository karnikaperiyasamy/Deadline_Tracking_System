import { z } from 'zod';

export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  timezone: z.string().optional(),
  notificationEmail: z.boolean().optional(),
  aiPreferences: z.string().optional(),
});
