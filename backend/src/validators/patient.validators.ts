import { z } from 'zod';

export const updateProfileSchema = z.object({
  dateOfBirth: z.string().datetime().optional(),
  gestationalWeekAtRegistration: z.number().int().min(1).max(42).optional(),
  currentGestationalWeek: z.number().int().min(1).max(42).optional()
});

export const assignDoctorSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID format')
});
