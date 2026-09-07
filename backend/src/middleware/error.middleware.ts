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

  // If a static asset request errored, return plain text instead of JSON to prevent MIME type mismatch errors
  if (/\.(css|js|map|png|jpg|jpeg|gif|ico|svg|woff2?)$/i.test(req.path)) {
    return res.status(err.status || 404).type('text/plain').send(err.message || 'Asset not found');
  }

  if (err.name === 'ZodError') {
    return sendError(res, err.errors?.[0]?.message || 'Validation error', 400, 'VALIDATION_ERROR');
  }

  // Handle Prisma Database Connection or Authentication Errors
  if (
    (err.code && (err.code.startsWith('P100') || err.code === 'P1012')) ||
    (err.message && err.message.includes('Authentication failed'))
  ) {
    return sendError(
      res,
      'Database Authentication Failure: The DATABASE_URL environment variable is referencing invalid credentials or an old database. Please update DATABASE_URL in your Render Web Service Environment settings to point to your free Neon.tech or Supabase PostgreSQL database.',
      500,
      'DATABASE_CONNECTION_ERROR'
    );
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? message : message,
    statusCode,
    'SERVER_ERROR'
  );
};
