import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import aiRoutes from './ai.routes';
import notificationRoutes from './notification.routes';
import analyticsRoutes from './analytics.routes';
import searchRoutes from './search.routes';
import settingsRoutes from './settings.routes';
import profileRoutes from './profile.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/ai', aiRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/search', searchRoutes);
router.use('/settings', settingsRoutes);
router.use('/profile', profileRoutes);

export default router;
