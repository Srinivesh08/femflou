export type BiomarkerStatus = 'normal' | 'abnormal' | 'severe';

export interface BiomarkerReference {
  name: string;
  unit: string;
  ranges: {
    normal: string;
    abnormal: string;
    severe?: string;
  };
  evaluate: (value: number | string) => BiomarkerStatus;
  generateMock: () => { value: string | number; status: BiomarkerStatus };
}

export const BIOMARKERS: Record<string, BiomarkerReference> = {
  albumin: {
    name: 'Albumin (Protein)',
    unit: 'mg/L',
    ranges: {
      normal: '<30 mg/L',
      abnormal: '≥30 mg/L',
      severe: '≥300 mg/L',
    },
    evaluate: (val) => {
      const v = Number(val);
      if (v >= 300) return 'severe';
      if (v >= 30) return 'abnormal';
      return 'normal';
    },
    generateMock: () => {
      const rand = Math.random();
      if (rand < 0.7) return { value: Math.floor(Math.random() * 20), status: 'normal' };
      if (rand < 0.9) return { value: Math.floor(Math.random() * 200) + 30, status: 'abnormal' };
      return { value: Math.floor(Math.random() * 500) + 300, status: 'severe' };
    },
  },
  glucose: {
    name: 'Glucose',
    unit: 'mg/dL',
    ranges: {
      normal: 'negative',
      abnormal: '≥100 mg/dL',
    },
    evaluate: (val) => {
      if (typeof val === 'string' && val.toLowerCase() === 'negative') return 'normal';
      const v = Number(val);
      if (v >= 100) return 'abnormal';
      return 'normal';
    },
    generateMock: () => {
      const rand = Math.random();
      if (rand < 0.8) return { value: 'Negative', status: 'normal' };
      return { value: Math.floor(Math.random() * 150) + 100, status: 'abnormal' };
    },
  },
  ketones: {
    name: 'Ketones',
    unit: '',
    ranges: {
      normal: 'negative',
      abnormal: 'moderate to large',
    },
    evaluate: (val) => {
      if (typeof val === 'string' && val.toLowerCase() === 'negative') return 'normal';
      return 'abnormal';
    },
    generateMock: () => {
      const rand = Math.random();
      if (rand < 0.85) return { value: 'Negative', status: 'normal' };
      return { value: rand < 0.95 ? 'Moderate' : 'Large', status: 'abnormal' };
    },
  },
  leukocyte: {
    name: 'Leukocyte Esterase',
    unit: '',
    ranges: {
      normal: 'negative',
      abnormal: 'positive',
    },
    evaluate: (val) => {
      if (typeof val === 'string' && val.toLowerCase().includes('negative')) return 'normal';
      return 'abnormal';
    },
    generateMock: () => {
      const rand = Math.random();
      if (rand < 0.75) return { value: 'Negative', status: 'normal' };
      return { value: 'Positive (+)', status: 'abnormal' };
    },
  },
  nitrite: {
    name: 'Nitrite',
    unit: '',
    ranges: {
      normal: 'negative',
      abnormal: 'positive',
    },
    evaluate: (val) => {
      if (typeof val === 'string' && val.toLowerCase() === 'negative') return 'normal';
      return 'abnormal';
    },
    generateMock: () => {
      const rand = Math.random();
      if (rand < 0.9) return { value: 'Negative', status: 'normal' };
      return { value: 'Positive', status: 'abnormal' };
    },
  },
  ph: {
    name: 'pH',
    unit: '',
    ranges: {
      normal: '4.5 - 8.0',
      abnormal: '<4.5 or >8.0',
    },
    evaluate: (val) => {
      const v = Number(val);
      if (v < 4.5 || v > 8.0) return 'abnormal';
      return 'normal';
    },
    generateMock: () => {
      const rand = Math.random();
      if (rand < 0.9) return { value: (Math.random() * (8.0 - 4.5) + 4.5).toFixed(1), status: 'normal' };
      if (Math.random() > 0.5) return { value: (Math.random() * 1.5 + 3.0).toFixed(1), status: 'abnormal' }; // < 4.5
      return { value: (Math.random() * 1.5 + 8.1).toFixed(1), status: 'abnormal' }; // > 8.0
    },
  },
};

export const generateMockResult = () => {
  const result: any = {
    id: `RES-${Math.floor(Math.random() * 10000)}`,
    date: new Date().toISOString(),
    biomarkers: {},
    riskScore: 100, // Will be calculated
    riskLabel: 'Low Risk',
  };

  let abnormalCount = 0;
  let severeCount = 0;

  Object.entries(BIOMARKERS).forEach(([key, ref]) => {
    const mock = ref.generateMock();
    result.biomarkers[key] = {
      name: ref.name,
      value: mock.value,
      unit: ref.unit,
      status: mock.status,
    };
    if (mock.status === 'abnormal') abnormalCount++;
    if (mock.status === 'severe') severeCount++;
  });

  // Simple mock risk calculation
  if (severeCount > 0) {
    result.riskScore = Math.floor(Math.random() * 30) + 20; // 20-50
    result.riskLabel = 'Elevated Risk';
  } else if (abnormalCount > 1) {
    result.riskScore = Math.floor(Math.random() * 20) + 60; // 60-80
    result.riskLabel = 'Monitor';
  } else {
    result.riskScore = Math.floor(Math.random() * 15) + 85; // 85-100
    result.riskLabel = 'Low Risk';
  }

  return result;
};
