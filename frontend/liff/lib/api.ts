const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface ApiOptions extends RequestInit {
  needAuth?: boolean;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { needAuth = false, headers = {}, ...restOptions } = options;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (needAuth) {
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...restOptions,
    headers: { ...defaultHeaders, ...headers },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || 'Request failed');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Auth APIs
export const authApi = {
  verify: (idToken: string) =>
    request<{ userId: string; role: string; patientId?: string }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),
  register: (data: { firebaseUid: string; email: string; role: string; patientId?: string }) =>
    request<{ userId: string; role: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Symptoms APIs
export const symptomsApi = {
  list: (patientId: string, options?: { limit?: number; offset?: number }) =>
    request(`/symptoms?patientId=${patientId}&limit=${options?.limit || 20}&offset=${options?.offset || 0}`, {
      needAuth: true,
    }),
  create: (patientId: string, data: { type: string; severity: number; notes?: string; timestamp: string }) =>
    request('/symptoms', {
      method: 'POST',
      needAuth: true,
      body: JSON.stringify({ ...data, patientId }),
    }),
  bulkCreate: (patientId: string, items: Array<{ type: string; severity: number; notes?: string; timestamp: string }>) =>
    request('/symptoms/bulk', {
      method: 'POST',
      needAuth: true,
      body: JSON.stringify({ patientId, items }),
    }),
  summary: (patientId: string, period?: 'day' | 'week' | 'month') =>
    request(`/symptoms/summary?patientId=${patientId}${period ? `&period=${period}` : ''}`, {
      needAuth: true,
    }),
  exportCsv: async (patientId: string) => {
    const url = `${API_BASE_URL}/symptoms/export?patientId=${patientId}`;
    const token = localStorage.getItem('authToken');
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token || ''}` },
    });
    if (!response.ok) throw new ApiError(response.status, 'Export failed');
    return response.blob();
  },
};

// Medications APIs
export const medicationsApi = {
  list: (patientId: string) =>
    request(`/medications?patientId=${patientId}`, { needAuth: true }),
  create: (patientId: string, data: { name: string; dosage: string; frequency: string }) =>
    request('/medications', {
      method: 'POST',
      needAuth: true,
      body: JSON.stringify({ ...data, patientId }),
    }),
  update: (id: string, data: { name: string; dosage: string; frequency: string }) =>
    request(`/medications/${id}`, {
      method: 'PUT',
      needAuth: true,
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request(`/medications/${id}`, { method: 'DELETE', needAuth: true }),
  log: (id: string, data: { takenAt: string; status: 'taken' | 'skipped' }) =>
    request(`/medications/${id}/log`, {
      method: 'POST',
      needAuth: true,
      body: JSON.stringify(data),
    }),
  logs: (patientId: string) =>
    request(`/medications/logs?patientId=${patientId}`, { needAuth: true }),
  compliance: (patientId: string) =>
    request(`/medications/compliance?patientId=${patientId}`, { needAuth: true }),
};

// Alerts APIs
export const alertsApi = {
  list: (patientId: string) =>
    request(`/alerts?patientId=${patientId}`, { needAuth: true }),
  resolve: (id: string, resolved: boolean, notes?: string) =>
    request(`/alerts/${id}/resolve`, {
      method: 'POST',
      needAuth: true,
      body: JSON.stringify({ resolved, notes }),
    }),
  history: (patientId: string) =>
    request(`/alerts/history?patientId=${patientId}`, { needAuth: true }),
};

// Sensor APIs
export const sensorApi = {
  submitTremor: (patientId: string, data: { rmsValue: number; duration: number; timestamp: string }) =>
    request('/sensor/tremor', {
      method: 'POST',
      needAuth: true,
      body: JSON.stringify({ ...data, patientId }),
    }),
  getBaseline: (patientId: string) =>
    request(`/sensor/tremor/baseline?patientId=${patientId}`, { needAuth: true }),
  setBaseline: (patientId: string, rmsBaseline: number) =>
    request('/sensor/tremor/baseline', {
      method: 'POST',
      needAuth: true,
      body: JSON.stringify({ patientId, rmsBaseline }),
    }),
  submitSteps: (patientId: string, data: { steps: number; distance?: number; timestamp: string }) =>
    request('/sensor/steps', {
      method: 'POST',
      needAuth: true,
      body: JSON.stringify({ ...data, patientId }),
    }),
};

// Caregiver APIs
export const caregiverApi = {
  listPatients: () => request('/caregiver/patients', { needAuth: true }),
  getPatientStatus: (patientId: string) =>
    request(`/caregiver/patients/${patientId}/status`, { needAuth: true }),
};

// Reports APIs
export const reportsApi = {
  monthly: (patientId: string, month?: number, year?: number) => {
    const params = new URLSearchParams({ patientId });
    if (month) params.append('month', String(month));
    if (year) params.append('year', String(year));
    return request(`/reports/monthly?${params}`);
  },
  pdf: async (patientId: string, month?: number, year?: number) => {
    const params = new URLSearchParams({ patientId });
    if (month) params.append('month', String(month));
    if (year) params.append('year', String(year));
    const url = `${API_BASE_URL}/reports/pdf?${params}`;
    const token = localStorage.getItem('authToken');
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token || ''}` },
    });
    if (!response.ok) throw new ApiError(response.status, 'PDF export failed');
    return response.blob();
  },
};

export { ApiError };
