import { prisma } from '../prisma';
import { BiomarkerType, RiskStatus } from '@prisma/client';
import crypto from 'crypto';

/**
 * SIMULATED COMPUTER VISION ANALYSIS ALGORITHM
 * --------------------------------------------
 * This service stands in for a real trained ML model.
 * It uses a deterministic hash of the sample ID (or image URL) to generate 
 * pseudo-random but consistent "measured values" for each biomarker.
 * 
 * To swap this for a real ML inference call in production:
 * 1. Remove the hashing logic.
 * 2. Invoke your Python/Torch server or AWS SageMaker endpoint passing the `sample.imageUrl`.
 * 3. Receive the bounding box intensities from the CV model.
 * 4. Map those intensities via the CalibrationCurve table.
 */

// Simple deterministic PRNG based on a string seed
function sfc32(a: number, b: number, c: number, d: number) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
    let t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

function generateSeededRandom(seed: string) {
  const hash = crypto.createHash('md5').update(seed).digest('hex');
  const a = parseInt(hash.substring(0, 8), 16);
  const b = parseInt(hash.substring(8, 16), 16);
  const c = parseInt(hash.substring(16, 24), 16);
  const d = parseInt(hash.substring(24, 32), 16);
  return sfc32(a, b, c, d);
}

// Ranges based on medical definitions in prompt
function determineAlbuminRisk(value: number): RiskStatus {
  if (value < 30) return RiskStatus.NORMAL;
  if (value < 300) return RiskStatus.HIGH; // abnormal
  return RiskStatus.CRITICAL; // severe
}

function determineGlucoseRisk(value: number): RiskStatus {
  if (value < 100) return RiskStatus.NORMAL; // normal negative
  return RiskStatus.HIGH; // abnormal >= 100
}

function determineKetonesRisk(value: number): RiskStatus {
  if (value < 15) return RiskStatus.NORMAL;
  return RiskStatus.HIGH;
}

function determineLeukocyteRisk(value: number): RiskStatus {
  if (value < 15) return RiskStatus.NORMAL;
  return RiskStatus.HIGH;
}

function determineNitriteRisk(value: number): RiskStatus {
  if (value < 0.05) return RiskStatus.NORMAL;
  return RiskStatus.HIGH;
}

function determinePhRisk(value: number): RiskStatus {
  if (value >= 4.5 && value <= 8.0) return RiskStatus.NORMAL;
  return RiskStatus.HIGH;
}

export async function runAnalysis(sampleId: string) {
  const sample = await prisma.sample.findUnique({
    where: { id: sampleId },
    include: { patient: true }
  });

  if (!sample) throw new Error('Sample not found');

  // Deterministic seed per sample
  const rand = generateSeededRandom(sample.id);

  const biomarkers = [
    { type: BiomarkerType.ALBUMIN, unit: 'mg/L', eval: determineAlbuminRisk, range: [0, 350] },
    { type: BiomarkerType.GLUCOSE, unit: 'mg/dL', eval: determineGlucoseRisk, range: [0, 200] },
    { type: BiomarkerType.KETONES, unit: 'mg/dL', eval: determineKetonesRisk, range: [0, 80] },
    { type: BiomarkerType.LEUKOCYTE_ESTERASE, unit: 'WBC/uL', eval: determineLeukocyteRisk, range: [0, 500] },
    { type: BiomarkerType.NITRITE, unit: 'mg/dL', eval: determineNitriteRisk, range: [0, 1.0] },
    { type: BiomarkerType.PH, unit: 'pH', eval: determinePhRisk, range: [4.0, 9.0] }
  ];

  let abnormalCount = 0;
  let hasCritical = false;
  const results = [];
  const abnormalNames: string[] = [];
  const normalNames: string[] = [];

  for (const b of biomarkers) {
    // Generate a plausible intensity
    const intensityRaw = rand();
    
    // In a real scenario, we'd lookup the CalibrationCurve for this biomarker type.
    // For this simulation, we'll directly map the random value to the typical range.
    const val = b.range[0] + (intensityRaw * (b.range[1] - b.range[0]));
    const measuredValue = parseFloat(val.toFixed(2));
    
    const riskStatus = b.eval(measuredValue);
    
    if (riskStatus !== RiskStatus.NORMAL) {
      abnormalCount++;
      abnormalNames.push(b.type.toString());
      if (riskStatus === RiskStatus.CRITICAL) {
        hasCritical = true;
      }
    } else {
      normalNames.push(b.type.toString());
    }

    results.push({
      sampleId,
      biomarkerType: b.type,
      measuredValue,
      unit: b.unit,
      riskStatus,
      confidenceScore: parseFloat((0.85 + (rand() * 0.14)).toFixed(2)) // 0.85-0.99
    });
  }

  // Save biomarker results
  await prisma.biomarkerResult.createMany({
    data: results
  });

  // Determine overall risk
  let overallRiskScore = (abnormalCount / 6) * 100;
  
  const isAlert = hasCritical || overallRiskScore > 66;
  let alertMessage: string | null = null;
  if (isAlert) {
    alertMessage = "CRITICAL: Patient shows severe anomalies requiring immediate triage.";
  }

  // Generate AI Summary
  let summary = '';
  if (abnormalCount === 0) {
    summary = `All biomarkers (${normalNames.join(', ')}) remain within expected limits. No immediate concerns detected.`;
  } else {
    summary = `Analysis indicates elevated levels for ${abnormalNames.join(', ')}, suggesting possible metabolic or urinary tract abnormalities. `;
    if (normalNames.length > 0) {
      summary += `Other biomarkers (${normalNames.join(', ')}) remain within expected limits. `;
    }
    summary += `These findings require confirmation by qualified healthcare professionals.`;
  }

  // Create Report
  const report = await prisma.report.create({
    data: {
      sampleId,
      overallRiskScore,
      aiSummary: summary,
      recommendations: abnormalCount > 0 ? 'Consult with your assigned doctor for a follow-up.' : 'Continue routine monitoring.',
      isAlert,
      alertMessage
    }
  });

  // Update Sample status
  await prisma.sample.update({
    where: { id: sampleId },
    data: { status: 'ANALYZED' }
  });

  return report;
}
