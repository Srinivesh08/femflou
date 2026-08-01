import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── Mock API helpers ───
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  async getDashboardStats() {
    await delay(800);
    return {
      totalScreenings: 1247,
      activePatients: 83,
      highRiskCount: 12,
      avgConfidence: 94.2,
    };
  },

  async getRecentResults() {
    await delay(600);
    return [
      { id: '1', patientName: 'Patient A', risk: 'normal', confidence: 96, date: '2026-07-30' },
      { id: '2', patientName: 'Patient B', risk: 'mild', confidence: 82, date: '2026-07-29' },
      { id: '3', patientName: 'Patient C', risk: 'high', confidence: 88, date: '2026-07-28' },
    ];
  },

  async getResultById(id: string) {
    await delay(500);
    return {
      id,
      patientName: `Patient ${id}`,
      risk: 'normal' as const,
      confidence: 94,
      date: '2026-07-30',
      biomarkers: {},
    };
  },
};
