import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error handling request ${req.method} ${req.url}:`, err);

  if (err.name === 'ZodError') {
    return sendError(res, err.errors?.[0]?.message || 'Validation error', 400, 'VALIDATION_ERROR');
  }

  // Handle Prisma Database Connection Errors
  if (err.code && (err.code.startsWith('P100') || err.code === 'P1012')) {
    return sendError(
      res,
      'Database Connection Failure: Could not connect to PostgreSQL server. Please check DATABASE_URL in backend/.env (e.g. Supabase, Neon, or local PostgreSQL).',
      500,
      'DATABASE_CONNECTION_ERROR'
    );
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : message,
    statusCode,
    'SERVER_ERROR'
  );
};
