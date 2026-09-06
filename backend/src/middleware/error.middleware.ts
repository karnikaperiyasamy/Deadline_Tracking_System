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

  // Handle Prisma Database Connection Errors
  if (err.code && (err.code.startsWith('P100') || err.code === 'P1012')) {
    return sendError(
      res,
      'Database Connection Failure: Could not connect to PostgreSQL server. Please check DATABASE_URL in backend/.env.',
      500,
      'DATABASE_CONNECTION_ERROR'
    );
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : message,
    statusCode,
    'SERVER_ERROR'
  );
};
