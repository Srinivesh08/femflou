import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { generateReportPdf } from '../services/pdfService';

export const getReportById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        sample: {
          include: {
            patient: {
              include: { user: { select: { id: true, name: true, email: true } } }
            },
            biomarkerResults: true
          }
        },
        doctorComments: {
          include: { doctor: { select: { id: true, name: true } } }
        }
      }
    });

    if (!report) {
      res.status(404).json({ error: { message: 'Report not found', code: 'NOT_FOUND' } });
      return;
    }

    // Authorization
    const patientProfile = report.sample.patient;
    if (user.role === 'PATIENT' && patientProfile.userId !== user.id) {
      res.status(403).json({ error: { message: 'Forbidden', code: 'FORBIDDEN' } });
      return;
    }
    if (user.role === 'DOCTOR' && patientProfile.assignedDoctorId !== user.id) {
      res.status(403).json({ error: { message: 'Forbidden: Patient not assigned to you', code: 'FORBIDDEN' } });
      return;
    }

    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};

export const listReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { from, to, riskLevel } = req.query;
    
    let patientId = req.query.patientId as string | undefined;

    if (user.role === 'PATIENT') {
      const profile = await prisma.patientProfile.findUnique({ where: { userId: user.id } });
      if (!profile) {
        res.status(404).json({ error: { message: 'Patient profile not found', code: 'NOT_FOUND' } });
        return;
      }
      patientId = profile.id; // Force own patient profile ID
    }

    const whereClause: any = {};

    if (patientId) {
      whereClause.sample = { patientId };
    } else if (user.role === 'DOCTOR') {
      // If doctor hasn't specified a patientId, only list reports for patients assigned to them
      whereClause.sample = {
        patient: { assignedDoctorId: user.id }
      };
    }

    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt.gte = new Date(from as string);
      if (to) whereClause.createdAt.lte = new Date(to as string);
    }

    if (riskLevel) {
      // Map overallRiskScore to bands
      // NORMAL = 0
      // MILD = >0 to 33
      // HIGH = >33 to 66
      // CRITICAL = >66 to 100
      switch (riskLevel) {
        case 'NORMAL':
          whereClause.overallRiskScore = 0;
          break;
        case 'MILD':
          whereClause.overallRiskScore = { gt: 0, lte: 33 };
          break;
        case 'HIGH':
          whereClause.overallRiskScore = { gt: 33, lte: 66 };
          break;
        case 'CRITICAL':
          whereClause.overallRiskScore = { gt: 66, lte: 100 };
          break;
      }
    }

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const skip = (page - 1) * pageSize;

    const [reports, totalCount] = await Promise.all([
      prisma.report.findMany({
        where: whereClause,
        include: {
          sample: {
            select: { id: true, status: true, patient: { select: { user: { select: { name: true } } } } }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.report.count({ where: whereClause })
    ]);

    res.status(200).json({
      data: reports,
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

export const getTrend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const report = await prisma.report.findUnique({
      where: { id },
      include: { sample: { include: { patient: true } } }
    });

    if (!report) {
      res.status(404).json({ error: { message: 'Report not found', code: 'NOT_FOUND' } });
      return;
    }

    const patientProfile = report.sample.patient;

    if (user.role === 'PATIENT' && patientProfile.userId !== user.id) {
      res.status(403).json({ error: { message: 'Forbidden', code: 'FORBIDDEN' } });
      return;
    }
    if (user.role === 'DOCTOR' && patientProfile.assignedDoctorId !== user.id) {
      res.status(403).json({ error: { message: 'Forbidden: Patient not assigned to you', code: 'FORBIDDEN' } });
      return;
    }

    // Fetch all biomarker results for this patient, joined with sample date
    const results = await prisma.biomarkerResult.findMany({
      where: {
        sample: { patientId: patientProfile.id, status: 'ANALYZED' }
      },
      include: {
        sample: { select: { uploadedAt: true } }
      },
      orderBy: {
        sample: { uploadedAt: 'asc' }
      }
    });

    // Group by biomarker type
    const trendData: Record<string, { date: Date; value: number; riskStatus: string }[]> = {};

    for (const r of results) {
      if (!trendData[r.biomarkerType]) {
        trendData[r.biomarkerType] = [];
      }
      trendData[r.biomarkerType].push({
        date: r.sample.uploadedAt,
        value: r.measuredValue,
        riskStatus: r.riskStatus
      });
    }

    res.status(200).json(trendData);
  } catch (error) {
    next(error);
  }
};

export const downloadPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        sample: {
          include: {
            patient: {
              include: { user: { select: { id: true, name: true, email: true } } }
            },
            biomarkerResults: true
          }
        },
        doctorComments: {
          include: { doctor: { select: { id: true, name: true } } }
        }
      }
    });

    if (!report) {
      res.status(404).json({ error: { message: 'Report not found', code: 'NOT_FOUND' } });
      return;
    }

    // Authorization
    const patientProfile = report.sample.patient;
    if (user.role === 'PATIENT' && patientProfile.userId !== user.id) {
      res.status(403).json({ error: { message: 'Forbidden', code: 'FORBIDDEN' } });
      return;
    }
    if (user.role === 'DOCTOR' && patientProfile.assignedDoctorId !== user.id) {
      res.status(403).json({ error: { message: 'Forbidden: Patient not assigned to you', code: 'FORBIDDEN' } });
      return;
    }

    const pdfBuffer = await generateReportPdf(report);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="FEMFLOU_Report_${report.id.substring(0, 8)}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const compareReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportIdA, reportIdB } = req.query;

    if (!reportIdA || !reportIdB) {
      res.status(400).json({ error: { message: 'Both reportIdA and reportIdB are required', code: 'BAD_REQUEST' } });
      return;
    }

    const [reportA, reportB] = await Promise.all([
      prisma.report.findUnique({
        where: { id: reportIdA as string },
        include: { sample: { include: { biomarkerResults: true, patient: true } } }
      }),
      prisma.report.findUnique({
        where: { id: reportIdB as string },
        include: { sample: { include: { biomarkerResults: true, patient: true } } }
      })
    ]);

    if (!reportA || !reportB) {
      res.status(404).json({ error: { message: 'One or both reports not found', code: 'NOT_FOUND' } });
      return;
    }

    // Must belong to the same patient
    if (reportA.sample.patientId !== reportB.sample.patientId) {
      res.status(400).json({ error: { message: 'Cannot compare reports from different patients', code: 'BAD_REQUEST' } });
      return;
    }

    const deltas: Record<string, number> = {};

    reportB.sample.biomarkerResults.forEach(resB => {
      const resA = reportA.sample.biomarkerResults.find(a => a.biomarkerType === resB.biomarkerType);
      if (resA) {
        deltas[resB.biomarkerType] = parseFloat((resB.measuredValue - resA.measuredValue).toFixed(2));
      }
    });

    res.status(200).json({
      reportA,
      reportB,
      deltas
    });
  } catch (error) {
    next(error);
  }
};

export const approveReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user!; // Guarded by requireRole

    const report = await prisma.report.update({
      where: { id },
      data: {
        reviewedByDoctorId: user.id,
        reviewedAt: new Date()
      }
    });

    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const user = req.user!;

    if (!text) {
      res.status(400).json({ error: { message: 'Comment text is required', code: 'BAD_REQUEST' } });
      return;
    }

    const comment = await prisma.doctorComment.create({
      data: {
        text,
        reportId: id,
        doctorId: user.id
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const comments = await prisma.doctorComment.findMany({
      where: { reportId: id },
      include: {
        doctor: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};
