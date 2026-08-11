import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';

export const verifyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params;

    const report = await prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      res.status(404).json({ exists: false });
      return;
    }

    res.status(200).json({
      exists: true,
      createdAt: report.createdAt,
      isReviewed: report.reviewedByDoctorId !== null
    });
  } catch (error) {
    next(error);
  }
};
