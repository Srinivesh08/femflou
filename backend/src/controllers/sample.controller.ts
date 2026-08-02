import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { storageService } from '../services/storageService';
import { computeQualityScores } from '../services/imageProcessingService';
import { runAnalysis } from '../services/analysisService';

export const uploadSample = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: { message: 'No image file provided', code: 'BAD_REQUEST' } });
      return;
    }

    const userId = req.user!.id;
    const profile = await prisma.patientProfile.findUnique({ where: { userId } });

    if (!profile) {
      res.status(404).json({ error: { message: 'Patient profile not found', code: 'NOT_FOUND' } });
      return;
    }

    // 1. Compute Quality Scores
    const { brightnessScore, focusScore } = await computeQualityScores(req.file.buffer);

    // 2. Save file
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
    const imageUrl = await storageService.save(req.file.buffer, filename);

    // 3. Create Sample record
    const sample = await prisma.sample.create({
      data: {
        patientId: profile.id,
        imageUrl,
        brightnessScore,
        focusScore,
        status: 'UPLOADED'
      }
    });

    res.status(201).json(sample);
  } catch (error) {
    next(error);
  }
};

export const analyzeSample = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const sample = await prisma.sample.findUnique({
      where: { id },
      include: { patient: true }
    });

    if (!sample) {
      res.status(404).json({ error: { message: 'Sample not found', code: 'NOT_FOUND' } });
      return;
    }

    // Must own the sample
    if (sample.patient.userId !== userId) {
      res.status(403).json({ error: { message: 'Forbidden', code: 'FORBIDDEN' } });
      return;
    }

    if (sample.status === 'ANALYZED') {
      res.status(400).json({ error: { message: 'Sample already analyzed', code: 'BAD_REQUEST' } });
      return;
    }

    // Set to processing
    await prisma.sample.update({
      where: { id },
      data: { status: 'PROCESSING' }
    });

    // Run simulated analysis
    const report = await runAnalysis(id);

    // Fetch full data to return
    const fullSampleData = await prisma.sample.findUnique({
      where: { id },
      include: {
        report: true,
        biomarkerResults: true
      }
    });

    res.status(200).json(fullSampleData);
  } catch (error) {
    next(error);
  }
};

export const getSample = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const sample = await prisma.sample.findUnique({
      where: { id },
      include: {
        report: true,
        biomarkerResults: true,
        patient: true
      }
    });

    if (!sample) {
      res.status(404).json({ error: { message: 'Sample not found', code: 'NOT_FOUND' } });
      return;
    }

    // Basic auth check
    if (req.user!.role === 'PATIENT' && sample.patient.userId !== req.user!.id) {
      res.status(403).json({ error: { message: 'Forbidden', code: 'FORBIDDEN' } });
      return;
    }

    res.status(200).json(sample);
  } catch (error) {
    next(error);
  }
};
