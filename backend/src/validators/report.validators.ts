import { z } from 'zod';

export const listReportsQuerySchema = z.object({
  patientId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  riskLevel: z.enum(['NORMAL', 'MILD', 'HIGH', 'CRITICAL']).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  pageSize: z.string().regex(/^\d+$/).optional()
});

export const commentSchema = z.object({
  text: z.string().min(1, 'Comment text is required')
});
