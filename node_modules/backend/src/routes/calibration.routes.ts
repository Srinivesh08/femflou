import { Router } from 'express';
import { getCalibrationCurve, getAllCalibrationCurves } from '../controllers/calibration.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// These endpoints require auth to prevent public snooping, but apply caching headers in the controller.
router.get('/', requireAuth, getAllCalibrationCurves);
router.get('/:biomarkerType', requireAuth, getCalibrationCurve);

export default router;
