import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/dashboard', AnalyticsController.getDashboard);
router.get('/full', AnalyticsController.getFullAnalytics);

export default router;
