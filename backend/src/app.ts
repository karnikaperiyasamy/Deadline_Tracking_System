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
      if (
        !origin ||
        config.env === 'development' ||
        config.clientUrls.includes(origin) ||
        config.clientUrls.includes('*') ||
        origin.includes('onrender.com')
      ) {
        callback(null, true);
      } else {
        logger.warn(`Blocked by CORS: ${origin}`);
        callback(null, false);
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
const possibleDistPaths = [
  path.resolve(__dirname, 'public'),
  path.resolve(process.cwd(), 'backend/dist/public'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
];

let activeDistPath: string | null = null;
for (const p of possibleDistPaths) {
  if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
    activeDistPath = p;
    break;
  }
}

if (activeDistPath) {
  logger.info(`Unified Server Mode: Serving static frontend build from ${activeDistPath}`);

  const assetsPath = path.join(activeDistPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    app.use('/assets', express.static(assetsPath, { maxAge: '1y', immutable: true }));
  }

  app.use(express.static(activeDistPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    if (/\.(js|css|png|jpg|jpeg|gif|ico|json|svg|woff2?|ttf|eot)$/i.test(req.path)) {
      return res.status(404).type('text/plain').send('Asset not found');
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
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
