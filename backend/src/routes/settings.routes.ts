import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { updateSettingsSchema } from '../validators/settings.validator';

const router = Router();

router.use(authenticateJWT);

router.get('/', SettingsController.getSettings);
router.put('/', validateRequest(updateSettingsSchema), SettingsController.updateSettings);

export default router;
