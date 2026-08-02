import { Router } from 'express';
import { getMeProfile, updateMeProfile, getPatientById, listPatients, assignDoctor, exportPatients } from '../controllers/patient.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { validateRequest, updateProfileSchema, assignDoctorSchema } from '../validators/patient.validators';

const router = Router();

// Order matters: specific routes before param routes

// 1. Patient managing their own profile
router.get('/me', requireAuth, requireRole('PATIENT'), getMeProfile);
router.patch('/me', requireAuth, requireRole('PATIENT'), validateRequest(updateProfileSchema), updateMeProfile);

// 2. Listing patients (Doctor / Admin only)
router.get('/', requireAuth, requireRole('DOCTOR', 'ADMIN'), listPatients);
router.get('/export', requireAuth, requireRole('DOCTOR', 'ADMIN'), exportPatients);

// 3. Get specific patient by ID (Auth check logic handled in controller)
router.get('/:id', requireAuth, getPatientById);

// 4. Assign a doctor to a patient (Admin only)
router.post('/:id/assign-doctor', requireAuth, requireRole('ADMIN'), validateRequest(assignDoctorSchema), assignDoctor);

export default router;
