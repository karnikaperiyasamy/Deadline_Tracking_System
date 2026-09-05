import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  aiChatSchema,
  aiTaskBreakdownSchema,
  aiNaturalLanguageSchema,
  aiRiskAnalysisSchema,
} from '../validators/ai.validator';

const router = Router();

router.use(authenticateJWT);

router.post('/chat', validateRequest(aiChatSchema), AIController.chat);
router.post('/daily-plan', AIController.generateDailyPlan);
router.post('/task-breakdown', validateRequest(aiTaskBreakdownSchema), AIController.taskBreakdown);
router.post('/risk-analysis', validateRequest(aiRiskAnalysisSchema), AIController.riskAnalysis);
router.post('/parse-nl', validateRequest(aiNaturalLanguageSchema), AIController.parseNaturalLanguage);

export default router;
