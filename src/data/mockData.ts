export interface Report {
  id: string;
  date: string;
  gestationalWeek: number;
  riskScore: number;
  riskLabel: 'Low Risk' | 'Monitor' | 'Elevated Risk' | 'Critical';
  biomarkers: {
    albumin: number;
    glucose: number;
    ketones: number;
    leukocyte: number;
    nitrite: number;
    ph: number;
  };
  approved?: boolean;
  comments?: { text: string; doctor: string; date: string }[];
}

export interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gestationalWeek: number;
  avatarUrl?: string;
  lastVisit: string;
  reports?: Report[];
}

export interface Biomarker {
  name: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface Alert {
  id: string;
  message: string;
  level: 'warning' | 'critical';
  date: string;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  type: string;
}

export const mockReports: Report[] = [
  {
    id: 'REP-401',
    date: '2023-10-24',
    gestationalWeek: 24,
    riskScore: 82,
    riskLabel: 'Monitor',
    biomarkers: { albumin: 15, glucose: 110, ketones: 0, leukocyte: 1, nitrite: 0, ph: 6.5 },
    approved: false,
    comments: [],
  },
  {
    id: 'REP-400',
    date: '2023-10-17',
    gestationalWeek: 23,
    riskScore: 85,
    riskLabel: 'Low Risk',
    biomarkers: { albumin: 12, glucose: 95, ketones: 0, leukocyte: 0, nitrite: 0, ph: 6.4 },
    approved: true,
  },
  {
    id: 'REP-399',
    date: '2023-10-10',
    gestationalWeek: 22,
    riskScore: 88,
    riskLabel: 'Low Risk',
    biomarkers: { albumin: 10, glucose: 90, ketones: 0, leukocyte: 0, nitrite: 0, ph: 6.2 },
    approved: true,
  },
];

export const mockPatient: PatientInfo = {
  id: 'PT-8924',
  name: 'Sarah Jenkins',
  age: 29,
  gestationalWeek: 24,
  lastVisit: '2023-10-15',
  reports: mockReports,
};

export const mockPatientsList: PatientInfo[] = [
  mockPatient,
  {
    id: 'PT-8925',
    name: 'Emily Chen',
    age: 32,
    gestationalWeek: 18,
    lastVisit: '2023-10-20',
    reports: [
      {
        id: 'REP-500',
        date: '2023-10-20',
        gestationalWeek: 18,
        riskScore: 94,
        riskLabel: 'Low Risk',
        biomarkers: { albumin: 5, glucose: 85, ketones: 0, leukocyte: 0, nitrite: 0, ph: 6.0 },
        approved: true,
      },
      {
        id: 'REP-499',
        date: '2023-10-13',
        gestationalWeek: 17,
        riskScore: 92,
        riskLabel: 'Low Risk',
        biomarkers: { albumin: 4, glucose: 82, ketones: 0, leukocyte: 0, nitrite: 0, ph: 6.1 },
        approved: true,
      }
    ]
  },
  {
    id: 'PT-8926',
    name: 'Jessica Robles',
    age: 27,
    gestationalWeek: 32,
    lastVisit: '2023-10-23',
    reports: [
      {
        id: 'REP-600',
        date: '2023-10-23',
        gestationalWeek: 32,
        riskScore: 65,
        riskLabel: 'Elevated Risk',
        biomarkers: { albumin: 45, glucose: 140, ketones: 1, leukocyte: 2, nitrite: 1, ph: 7.2 },
        approved: false,
        comments: [
          { text: 'Significant proteinuria and glucosuria. Need to evaluate for preeclampsia.', doctor: 'Dr. Smith', date: '2023-10-23T14:30:00Z' }
        ]
      },
      {
        id: 'REP-599',
        date: '2023-10-16',
        gestationalWeek: 31,
        riskScore: 78,
        riskLabel: 'Monitor',
        biomarkers: { albumin: 25, glucose: 110, ketones: 0, leukocyte: 1, nitrite: 0, ph: 6.8 },
        approved: true,
      }
    ]
  },
  {
    id: 'PT-8927',
    name: 'Amanda Brooks',
    age: 35,
    gestationalWeek: 12,
    lastVisit: '2023-10-21',
    reports: [
      {
        id: 'REP-700',
        date: '2023-10-21',
        gestationalWeek: 12,
        riskScore: 89,
        riskLabel: 'Low Risk',
        biomarkers: { albumin: 10, glucose: 90, ketones: 0, leukocyte: 0, nitrite: 0, ph: 6.2 },
        approved: false,
      }
    ]
  }
];

export const mockBiomarkers: Biomarker[] = [
  { name: 'Albumin', value: '15', unit: 'mg/dL', status: 'normal' },
  { name: 'Glucose', value: '110', unit: 'mg/dL', status: 'warning' },
  { name: 'Ketones', value: 'Negative', unit: '', status: 'normal' },
  { name: 'Leukocyte Esterase', value: 'Positive (+)', unit: '', status: 'warning' },
  { name: 'Nitrite', value: 'Negative', unit: '', status: 'normal' },
  { name: 'pH', value: '6.5', unit: '', status: 'normal' },
];

export const mockAlerts: Alert[] = [
  {
    id: 'AL-101',
    message: 'Elevated Glucose detected in latest sample — dietary review recommended.',
    level: 'warning',
    date: '2023-10-24T09:00:00Z',
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: 'APT-1',
    date: 'Oct 28, 2023',
    time: '10:30 AM',
    doctorName: 'Dr. Emily Chen',
    type: 'Routine Checkup',
  }
];

export const currentRiskScore = 82;
export const currentRiskLabel = 'Monitor';
