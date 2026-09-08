import './env-sanitizer';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

prisma
  .$connect()
  .then(() => logger.info('Connected to PostgreSQL database via Prisma'))
  .catch((err: any) => logger.error('Database connection error:', err));
