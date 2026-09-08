import { PrismaClient } from '@prisma/client';
import { config } from './index';
import { logger } from '../utils/logger';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

prisma
  .$connect()
  .then(() => logger.info('Connected to PostgreSQL database via Prisma'))
  .catch((err: any) => logger.error('Database connection error:', err));
