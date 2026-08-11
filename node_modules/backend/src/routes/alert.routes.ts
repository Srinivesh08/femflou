import { Router } from 'express';
import { getAlerts } from '../controllers/alert.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Protected endpoint for doctors and admins to view active alerts
router.get('/', requireAuth, requireRole('DOCTOR', 'ADMIN'), getAlerts);

export default router;
