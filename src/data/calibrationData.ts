export interface CalibrationPoint {
  intensity: number;
  concentration: number;
  ciLower: number;
  ciUpper: number;
}

export interface BiomarkerCalibration {
  id: string;
  name: string;
  unit: string;
  equation: string;
  rSquared: string;
  points: CalibrationPoint[];
  curvePoints: CalibrationPoint[];
  unknownSample: { intensity: number; concentration: number };
}

const generateMockCurve = (
  slope: number,
  intercept: number,
  pointsCount: number,
  maxIntensity: number,
  noiseLevel: number,
  unknownIntensity: number
): { points: CalibrationPoint[]; curvePoints: CalibrationPoint[]; unknownSample: any } => {
  const points: CalibrationPoint[] = [];
  const curvePoints: CalibrationPoint[] = [];
  
  const step = maxIntensity / pointsCount;
  
  for (let i = 0; i <= maxIntensity; i += step) {
    const perfectY = slope * i + intercept;
    
    // Add standard solution point (with noise)
    if (i % (step * 2) === 0) {
      points.push({
        intensity: i,
        concentration: Math.max(0, perfectY + (Math.random() * noiseLevel * 2 - noiseLevel)),
        ciLower: 0, // unused for scatter
        ciUpper: 0,
      });
    }

    // Add curve point (perfect line with confidence interval)
    const ciBand = Math.max(2, perfectY * 0.15); // 15% confidence interval band
    curvePoints.push({
      intensity: i,
      concentration: Math.max(0, perfectY),
      ciLower: Math.max(0, perfectY - ciBand),
      ciUpper: perfectY + ciBand,
    });
  }

  const unknownConcentration = slope * unknownIntensity + intercept;

  return {
    points,
    curvePoints,
    unknownSample: {
      intensity: unknownIntensity,
      concentration: unknownConcentration,
    }
  };
};

export const calibrationData: Record<string, BiomarkerCalibration> = {
  albumin: {
    id: 'albumin',
    name: 'Albumin',
    unit: 'mg/L',
    equation: 'y = 3.2x + 1.5',
    rSquared: '0.992',
    ...generateMockCurve(3.2, 1.5, 20, 100, 15, 42),
  },
  glucose: {
    id: 'glucose',
    name: 'Glucose',
    unit: 'mg/dL',
    equation: 'y = 1.8x - 5.0',
    rSquared: '0.985',
    ...generateMockCurve(1.8, -5.0, 20, 120, 10, 65),
  },
  ketones: {
    id: 'ketones',
    name: 'Ketones',
    unit: 'mmol/L',
    equation: 'y = 0.5x + 0.1',
    rSquared: '0.978',
    ...generateMockCurve(0.5, 0.1, 20, 15, 0.5, 4.5),
  },
  leukocyte: {
    id: 'leukocyte',
    name: 'Leukocyte Esterase',
    unit: 'WBC/μL',
    equation: 'y = 4.1x + 10',
    rSquared: '0.965',
    ...generateMockCurve(4.1, 10, 20, 50, 12, 18),
  },
  nitrite: {
    id: 'nitrite',
    name: 'Nitrite',
    unit: 'μmol/L',
    equation: 'y = 2.0x + 0.5',
    rSquared: '0.991',
    ...generateMockCurve(2.0, 0.5, 20, 25, 1.5, 8.2),
  },
  ph: {
    id: 'ph',
    name: 'pH',
    unit: '',
    equation: 'y = 0.05x + 4.0',
    rSquared: '0.995',
    ...generateMockCurve(0.05, 4.0, 20, 80, 0.2, 35),
  },
};
