export interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gestationalWeek: number;
  avatarUrl?: string;
  lastVisit: string;
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

export interface Report {
  id: string;
  date: string;
  gestationalWeek: number;
  riskScore: number;
  riskLabel: 'Low Risk' | 'Monitor' | 'Elevated Risk';
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  type: string;
}

export const mockPatient: PatientInfo = {
  id: 'PT-8924',
  name: 'Sarah Jenkins',
  age: 29,
  gestationalWeek: 24,
  lastVisit: '2023-10-15',
};

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
  },
  {
    id: 'AL-102',
    message: 'Leukocyte Esterase positive. Monitor for potential UTI symptoms.',
    level: 'warning',
    date: '2023-10-24T09:05:00Z',
  }
];

export const mockTrendData = [
  { date: 'Week 20', score: 95 },
  { date: 'Week 21', score: 92 },
  { date: 'Week 22', score: 88 },
  { date: 'Week 23', score: 85 },
  { date: 'Week 24', score: 82 },
];

export const mockReports: Report[] = [
  {
    id: 'REP-401',
    date: 'Oct 24, 2023',
    gestationalWeek: 24,
    riskScore: 82,
    riskLabel: 'Monitor',
  },
  {
    id: 'REP-400',
    date: 'Oct 17, 2023',
    gestationalWeek: 23,
    riskScore: 85,
    riskLabel: 'Low Risk',
  },
  {
    id: 'REP-399',
    date: 'Oct 10, 2023',
    gestationalWeek: 22,
    riskScore: 88,
    riskLabel: 'Low Risk',
  },
  {
    id: 'REP-398',
    date: 'Oct 03, 2023',
    gestationalWeek: 21,
    riskScore: 92,
    riskLabel: 'Low Risk',
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: 'APT-1',
    date: 'Oct 28, 2023',
    time: '10:30 AM',
    doctorName: 'Dr. Emily Chen',
    type: 'Routine Checkup',
  },
  {
    id: 'APT-2',
    date: 'Nov 12, 2023',
    time: '02:00 PM',
    doctorName: 'Dr. Michael Roberts',
    type: 'Anatomy Scan Follow-up',
  }
];

export const currentRiskScore = 82;
export const currentRiskLabel = 'Monitor';
