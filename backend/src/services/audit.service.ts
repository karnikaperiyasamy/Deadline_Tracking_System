import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';

export class AuditService {
  static async log(userId: string | null, action: string, details?: any, ipAddress?: string, userAgent?: string) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          details: details ? JSON.stringify(details) : null,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
      });
    } catch (error) {
      logger.error('Failed to record audit log:', error);
    }
  }
}
