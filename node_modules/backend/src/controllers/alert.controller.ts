import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';

export const getAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;

    const whereClause: any = {
      isAlert: true
    };

    // If doctor, only see alerts for their assigned patients
    if (user.role === 'DOCTOR') {
      whereClause.sample = {
        patient: {
          assignedDoctorId: user.id
        }
      };
    }

    const alerts = await prisma.report.findMany({
      where: whereClause,
      include: {
        sample: {
          include: {
            patient: {
              include: { user: { select: { id: true, name: true } } }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(alerts);
  } catch (error) {
    next(error);
  }
};
