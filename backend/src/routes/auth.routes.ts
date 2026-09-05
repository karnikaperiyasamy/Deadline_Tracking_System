import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { z } from 'zod';

const router = Router();

const verifyOtpSchema = z.object({
  email: z.string().email('Valid email address required'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

const resendOtpSchema = z.object({
  email: z.string().email('Valid email address required'),
});

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/verify-otp', validateRequest(verifyOtpSchema), AuthController.verifyOTP);
router.post('/resend-otp', validateRequest(resendOtpSchema), AuthController.resendOTP);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/me', authenticateJWT, AuthController.getMe);
router.post('/logout', authenticateJWT, AuthController.logout);

export default router;
