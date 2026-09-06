import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';

const app = express();

// Security Headers (relaxed Content-Security-Policy in static mode)
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.clientUrls.includes(origin) || config.env === 'development') {
        callback(null, true);
      } else {
        logger.warn(`Blocked by CORS: ${origin}`);
        callback(new Error('CORS access disallowed for this origin'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting for API endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later after 15 minutes.',
    error: 'RATE_LIMIT_EXCEEDED',
  },
});

app.use('/api', limiter);

// Request Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging Middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api', routes);

// Serve Frontend Static Build if available (Unified Server Mode)
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
const altDistPath = path.resolve(process.cwd(), 'frontend/dist');

const activeDistPath = fs.existsSync(frontendDistPath)
  ? frontendDistPath
  : fs.existsSync(altDistPath)
  ? altDistPath
  : null;

if (activeDistPath) {
  logger.info(`Unified Server Mode: Serving static frontend build from ${activeDistPath}`);
  app.use(express.static(activeDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    if (/\.(js|css|png|jpg|jpeg|gif|ico|json|svg|woff2?|ttf|eot)$/i.test(req.path)) {
      return res.status(404).send('Asset not found');
    }
    res.sendFile(path.join(activeDistPath, 'index.html'));
  });
} else {
  // API 404 Route Handler when running in decoupled API-only mode
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Endpoint ${req.method} ${req.originalUrl} not found`,
      error: 'NOT_FOUND',
    });
  });
}

// Centralized Error Handling
app.use(errorHandler);

export default app;
