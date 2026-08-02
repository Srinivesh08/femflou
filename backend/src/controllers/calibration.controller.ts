import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { BiomarkerType } from '@prisma/client';

export const getCalibrationCurve = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { biomarkerType } = req.params;
    const { sampleId } = req.query;

    const typeEnum = biomarkerType.toUpperCase() as BiomarkerType;
    if (!Object.values(BiomarkerType).includes(typeEnum)) {
      res.status(400).json({ error: { message: 'Invalid biomarker type', code: 'INVALID_INPUT' } });
      return;
    }

    const curve = await prisma.calibrationCurve.findFirst({
      where: { biomarkerType: typeEnum }
    });

    if (!curve) {
      res.status(404).json({ error: { message: 'Calibration curve not found', code: 'NOT_FOUND' } });
      return;
    }

    // Client caching
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day

    let samplePoint = null;
    if (sampleId) {
      const result = await prisma.biomarkerResult.findFirst({
        where: { sampleId: sampleId as string, biomarkerType: typeEnum }
      });
      if (result) {
        // We only have the measured value (concentration equivalent), so we infer the raw intensity based on the curve if we wanted to plot it, or just pass the value.
        // Actually, the result has the final value. The frontend can use the curve to plot it.
        samplePoint = {
          value: result.measuredValue,
          riskStatus: result.riskStatus
        };
      }
    }

    res.status(200).json({ curve, samplePoint });
  } catch (error) {
    next(error);
  }
};

export const getAllCalibrationCurves = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const curves = await prisma.calibrationCurve.findMany({
      select: {
        biomarkerType: true,
        regressionSlope: true,
        regressionIntercept: true,
        rSquared: true
      }
    });

    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    res.status(200).json(curves);
  } catch (error) {
    next(error);
  }
};
