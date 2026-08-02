import { Router } from 'express';
import { getReportById, listReports, getTrend, downloadPdf, compareReports, approveReport, addComment, getComments } from '../controllers/report.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { validateRequest as validateAuthRequest } from '../validators/auth.validators';
import { validateRequest, listReportsQuerySchema, commentSchema } from '../validators/report.validators';

const router = Router();

// validateRequest on req.query instead of body is a bit tricky with the current middleware,
// but since listReportsQuerySchema is all optional we can just use it or build a specific query validator.
// We will rely on manual validation in the controller for query params to avoid parsing issues, 
// or let zod validate req.query if we update the middleware. For now, we omit it to keep it simple.

router.get('/', requireAuth, listReports);
router.get('/compare', requireAuth, requireRole('DOCTOR', 'ADMIN'), compareReports);

router.get('/:id', requireAuth, getReportById);
router.post('/:id/pdf', requireAuth, downloadPdf);
router.get('/:id/trend', requireAuth, getTrend);

// Doctor specific routes
router.post('/:id/approve', requireAuth, requireRole('DOCTOR', 'ADMIN'), approveReport);
router.post('/:id/comments', requireAuth, requireRole('DOCTOR', 'ADMIN'), validateAuthRequest(commentSchema), addComment);
router.get('/:id/comments', requireAuth, requireRole('DOCTOR', 'ADMIN'), getComments);

export default router;
