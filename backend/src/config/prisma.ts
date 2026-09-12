import './env-sanitizer';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const rawPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

rawPrisma
  .$connect()
  .then(() => logger.info('Connected to PostgreSQL database via Prisma'))
  .catch((err: any) => logger.error('Database connection error:', err));

const isConnectionError = (error: any) => {
  const msg = String(error?.message || error || '');
  return (
    msg.includes('closed the connection') ||
    msg.includes('Connection lost') ||
    msg.includes('Can\'t reach database server') ||
    msg.includes('connection reset') ||
    msg.includes('Engine error') ||
    error?.code === 'P1017' ||
    error?.code === 'P1001' ||
    error?.code === 'P1002'
  );
};

export const prisma = rawPrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        let attempt = 0;
        const maxRetries = 3;
        while (attempt < maxRetries) {
          try {
            return await query(args);
          } catch (error: any) {
            attempt++;
            if (isConnectionError(error) && attempt < maxRetries) {
              logger.warn(
                `Prisma connection dropped during ${model}.${operation} (${error?.message || error?.code}). Retrying query (attempt ${attempt}/${maxRetries})...`
              );
              try {
                await rawPrisma.$disconnect();
                await rawPrisma.$connect();
              } catch (reconnectErr) {
                // ignore reconnect error
              }
              continue;
            }
            throw error;
          }
        }
        return await query(args);
      },
    },
  },
}) as unknown as PrismaClient;

export async function withPrismaRetry<T>(queryFn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await queryFn();
    } catch (error: any) {
      attempt++;
      if (isConnectionError(error) && attempt < maxRetries) {
        logger.warn(`Prisma connection dropped (${error?.message || error?.code}). Retrying query (attempt ${attempt}/${maxRetries})...`);
        try {
          await rawPrisma.$disconnect();
          await rawPrisma.$connect();
        } catch (reconnectErr) {
          // ignore disconnect error
        }
        continue;
      }
      throw error;
    }
  }
  return await queryFn();
}

