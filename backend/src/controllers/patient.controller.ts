import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';

export const getMeProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id; // Guaranteed by requireAuth

    const profile = await prisma.patientProfile.findUnique({
      where: { userId },
      include: {
        assignedDoctor: {
          select: { id: true, name: true, email: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!profile) {
      res.status(404).json({ error: { message: 'Patient profile not found', code: 'NOT_FOUND' } });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

export const updateMeProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { dateOfBirth, gestationalWeekAtRegistration, currentGestationalWeek } = req.body;

    const profile = await prisma.patientProfile.update({
      where: { userId },
      data: {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gestationalWeekAtRegistration,
        currentGestationalWeek
      },
      include: {
        assignedDoctor: { select: { id: true, name: true, email: true } },
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(200).json(profile);
  } catch (error) {
    // Prisma throws if record doesn't exist to update
    if ((error as any).code === 'P2025') {
      res.status(404).json({ error: { message: 'Patient profile not found', code: 'NOT_FOUND' } });
      return;
    }
    next(error);
  }
};

export const getPatientById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // This is the PatientProfile ID (or User ID depending on how frontend maps it, we'll assume it's PatientProfile ID, wait, requirement says "patient's full profile". Let's assume ID is PatientProfile id, but we'll check if it belongs to user).
    
    const profile = await prisma.patientProfile.findUnique({
      where: { id },
      include: {
        assignedDoctor: { select: { id: true, name: true, email: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
        samples: {
          orderBy: { uploadedAt: 'desc' },
          take: 5,
          include: { report: true }
        }
      }
    });

    if (!profile) {
      res.status(404).json({ error: { message: 'Patient profile not found', code: 'NOT_FOUND' } });
      return;
    }

    // Authorization check
    if (req.user!.role === 'PATIENT') {
      if (profile.userId !== req.user!.id) {
        res.status(403).json({ error: { message: 'Forbidden', code: 'FORBIDDEN' } });
        return;
      }
    } else if (req.user!.role === 'DOCTOR') {
      // Allow doctor to see all patients, or just their assigned ones.
      // Requirement: "doctors can only see patients (not manage other doctors/admins)".
      // For now, any doctor can view a patient's profile.
    } else if (req.user!.role === 'ADMIN') {
      // Admin is allowed
    } else {
      res.status(403).json({ error: { message: 'Forbidden', code: 'FORBIDDEN' } });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

export const listPatients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Query params
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const search = req.query.search as string | undefined;
    const riskLevel = req.query.riskLevel as string | undefined; // e.g. NORMAL, MILD, HIGH, CRITICAL

    const skip = (page - 1) * pageSize;

    // Base filter
    const whereClause: any = {};
    
    if (search) {
      whereClause.user = {
        name: { contains: search, mode: 'insensitive' }
      };
    }

    if (riskLevel) {
      // Using the simplified query from the implementation plan:
      // Filter patients who have ANY sample whose BiomarkerResult matches the requested riskStatus.
      // Alternatively, check the report's overallRiskScore range, but we don't have predefined ranges yet.
      // Wait, riskLevel was specified as the band for BiomarkerResult (NORMAL, MILD, HIGH, CRITICAL).
      whereClause.samples = {
        some: {
          biomarkerResults: {
            some: {
              riskStatus: riskLevel
            }
          }
        }
      };
    }

    const [patients, totalCount] = await Promise.all([
      prisma.patientProfile.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true, email: true } },
          assignedDoctor: { select: { id: true, name: true } },
          samples: {
            orderBy: { uploadedAt: 'desc' },
            take: 1,
            include: { report: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.patientProfile.count({ where: whereClause })
    ]);

    res.status(200).json({
      data: patients,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const assignDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // PatientProfile ID
    const { doctorId } = req.body;

    // Verify doctor exists and is a doctor
    const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
    if (!doctor || doctor.role !== 'DOCTOR') {
      res.status(400).json({ error: { message: 'Invalid doctor ID', code: 'INVALID_INPUT' } });
      return;
    }

    const profile = await prisma.patientProfile.update({
      where: { id },
      data: { assignedDoctorId: doctorId },
      include: {
        assignedDoctor: { select: { id: true, name: true, email: true } },
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(200).json(profile);
  } catch (error) {
    if ((error as any).code === 'P2025') {
      res.status(404).json({ error: { message: 'Patient profile not found', code: 'NOT_FOUND' } });
      return;
    }
    next(error);
  }
};

export const exportPatients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string | undefined;
    const riskLevel = req.query.riskLevel as string | undefined;
    
    const whereClause: any = {};
    
    if (search) {
      whereClause.user = {
        name: { contains: search, mode: 'insensitive' }
      };
    }

    if (riskLevel) {
      whereClause.samples = {
        some: {
          biomarkerResults: {
            some: {
              riskStatus: riskLevel
            }
          }
        }
      };
    }

    const patients = await prisma.patientProfile.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true } },
        samples: {
          orderBy: { uploadedAt: 'desc' },
          take: 1,
          include: { report: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Build CSV manually
    let csv = 'Name,Age,Gestational Week,Last Report Date,Risk Level\n';

    patients.forEach(p => {
      const name = `"${p.user.name.replace(/"/g, '""')}"`;
      
      let age = '';
      if (p.dateOfBirth) {
        const diff = Date.now() - p.dateOfBirth.getTime();
        const ageDate = new Date(diff); 
        age = Math.abs(ageDate.getUTCFullYear() - 1970).toString();
      }

      const week = p.currentGestationalWeek?.toString() || '';
      
      let lastReportDate = '';
      let riskLevelStr = '';
      if (p.samples.length > 0 && p.samples[0].report) {
        lastReportDate = p.samples[0].report.createdAt.toISOString();
        const score = p.samples[0].report.overallRiskScore;
        if (score === 0) riskLevelStr = 'NORMAL';
        else if (score <= 33) riskLevelStr = 'MILD';
        else if (score <= 66) riskLevelStr = 'HIGH';
        else riskLevelStr = 'CRITICAL';
      }

      csv += `${name},${age},${week},${lastReportDate},${riskLevelStr}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="patients_export.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
