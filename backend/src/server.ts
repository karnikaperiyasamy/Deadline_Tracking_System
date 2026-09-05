import dotenv from 'dotenv';
import path from 'path';

// Pre-load dotenv before any module imports
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { CronService } from './services/cron.service';

const PORT = config.port;

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`LifeOS Unified Backend Server running in [${config.env}] mode on http://0.0.0.0:${PORT}`);
  CronService.initDailyCron();
});

process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default server;
