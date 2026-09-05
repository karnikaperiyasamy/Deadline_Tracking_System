import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { updateProfileSchema, updatePasswordSchema } from '../validators/auth.validator';

const router = Router();

router.use(authenticateJWT);

router.put('/', validateRequest(updateProfileSchema), ProfileController.updateProfile);
router.put('/password', validateRequest(updatePasswordSchema), ProfileController.updatePassword);

export default router;
