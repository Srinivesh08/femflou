import { Router } from 'express';
import { register, login, refresh, getMe } from '../controllers/auth.controller';
import { validateRequest, registerSchema, loginSchema } from '../validators/auth.validators';
import { requireAuth } from '../middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: { message: 'Too many authentication attempts, please try again later.', code: 'RATE_LIMIT_EXCEEDED' } }
});

const router = Router();

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/refresh', authLimiter, refresh);
router.get('/me', requireAuth, getMe);

export default router;
