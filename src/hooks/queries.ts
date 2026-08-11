import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

// --- Auth ---
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await apiClient.post('/auth/login', credentials);
      return data;
    },
  });
};

export const useRegister = () => {
  return transformError(useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await apiClient.post('/auth/register', userData);
      return data;
    },
  }));
};

function transformError(mutation: any) { return mutation; }

// --- Patient/Dashboard ---
export const usePatientMe = () => {
  return useQuery({
    queryKey: ['patientMe'],
    queryFn: async () => {
      const { data } = await apiClient.get('/patients/me');
      return data;
    },
  });
};

// --- Reports ---
export const useReports = (patientId?: string) => {
  return useQuery({
    queryKey: ['reports', patientId],
    queryFn: async () => {
      const url = patientId ? `/reports?patientId=${patientId}` : '/reports';
      const { data } = await apiClient.get(url);
      return data.data || data;
    },
  });
};

export const useReportDetails = (reportId: string) => {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/reports/${reportId}`);
      return data;
    },
    enabled: !!reportId,
  });
};

export const useReportTrend = (reportId: string) => {
  return useQuery({
    queryKey: ['reportTrend', reportId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/reports/${reportId}/trend`);
      return data;
    },
    enabled: !!reportId,
  });
};

export const useCompareReports = (reportIdA: string, reportIdB: string) => {
  return useQuery({
    queryKey: ['compare', reportIdA, reportIdB],
    queryFn: async () => {
      const { data } = await apiClient.get(`/reports/compare?reportIdA=${reportIdA}&reportIdB=${reportIdB}`);
      return data;
    },
    enabled: !!reportIdA && !!reportIdB,
  });
};

export const useApproveReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reportId: string) => {
      const { data } = await apiClient.post(`/reports/${reportId}/approve`);
      return data;
    },
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reportId, text }: { reportId: string; text: string }) => {
      const { data } = await apiClient.post(`/reports/${reportId}/comments`, { text });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['comments', variables.reportId] });
    },
  });
};

// --- Upload Flow ---
export const useUploadSample = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await apiClient.post('/samples/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data; // { id, imageUrl, brightnessScore, focusScore, status }
    },
  });
};

export const useAnalyzeSample = () => {
  return useMutation({
    mutationFn: async (sampleId: string) => {
      const { data } = await apiClient.post(`/samples/${sampleId}/analyze`);
      return data; // { sample, report, status: 'ANALYZED' | 'FAILED' }
    },
  });
};

import { calibrationData } from '@/data/calibrationData';

// --- Calibration ---
export const useCalibrationData = (biomarkerType: string, sampleId?: string) => {
  return useQuery({
    queryKey: ['calibration', biomarkerType, sampleId],
    queryFn: async () => {
      // Return the rich frontend mock data which contains the necessary curve points and equations
      return calibrationData[biomarkerType];
    },
    enabled: !!biomarkerType,
  });
};

export const useAllCalibrationCurves = () => {
  return useQuery({
    queryKey: ['calibration', 'all'],
    queryFn: async () => {
      const { data } = await apiClient.get('/calibration');
      return data;
    },
  });
};

// --- Doctor Portal (Patients List) ---
export const usePatientsList = (search?: string, riskLevel?: string, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ['patients', search, riskLevel, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (riskLevel && riskLevel !== 'ALL') params.append('riskLevel', riskLevel);
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());

      const { data } = await apiClient.get(`/patients?${params.toString()}`);
      return data; // { data: [...], pagination: {...} }
    },
  });
};

// --- Alerts ---
export const useAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/alerts');
      return data;
    },
  });
};
