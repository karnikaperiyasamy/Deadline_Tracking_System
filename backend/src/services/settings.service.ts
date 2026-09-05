import { prisma } from '../config/prisma';

export class SettingsService {
  static async getSettings(userId: string) {
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          theme: 'dark',
          timezone: 'UTC',
          notificationEmail: true,
        },
      });
    }

    return settings;
  }

  static async updateSettings(userId: string, data: {
    theme?: string;
    timezone?: string;
    notificationEmail?: boolean;
    aiPreferences?: string;
  }) {
    const updated = await prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        theme: data.theme || 'dark',
        timezone: data.timezone || 'UTC',
        notificationEmail: data.notificationEmail ?? true,
        aiPreferences: data.aiPreferences || '{}',
      },
    });

    return updated;
  }
}
