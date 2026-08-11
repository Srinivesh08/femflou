import { Router } from 'express';
import { verifyReport } from '../controllers/verify.controller';

const router = Router();

// Public endpoint for QR code validation
router.get('/:reportId', verifyReport);

export default router;
