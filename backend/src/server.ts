import './config/env-sanitizer';
import dotenv from 'dotenv';
import path from 'path';

// Pre-load dotenv before any module imports
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

const defaultNeonUrl =
  'postgresql://neondb_owner:npg_zriZkC1WQph9@ep-hidden-shape-b3qm86ks-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=15';

if (
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.includes('skillbridge') ||
  process.env.DATABASE_URL.includes('dpg-dabv7k6k1f9s73dlugog')
) {
  process.env.DATABASE_URL = defaultNeonUrl;
}

import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { CronService } from './services/cron.service';
import https from 'https';
import http from 'http';

const PORT = config.port;

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`LifeOS Unified Backend Server running in [${config.env}] mode on http://0.0.0.0:${PORT}`);
  CronService.initDailyCron();

  // Self-Ping Keep-Alive for Render Free Tier (prevents 15-minute spin-down sleep)
  const serviceUrl = process.env.RENDER_EXTERNAL_URL || 'https://lifeos-system.onrender.com';
  const pingUrl = `${serviceUrl.replace(/\/$/, '')}/api/health`;
  setInterval(() => {
    try {
      const client = pingUrl.startsWith('https') ? https : http;
      client.get(pingUrl, (res) => {
        logger.info(`[Keep-Alive] Pinged ${pingUrl} - Status: ${res.statusCode}`);
      }).on('error', (err) => {
        logger.warn(`[Keep-Alive] Self-ping error: ${err.message}`);
      });
    } catch (e: any) {
      logger.warn(`[Keep-Alive] Exception: ${e.message}`);
    }
  }, 9 * 60 * 1000); // Every 9 minutes
});

process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default server;
