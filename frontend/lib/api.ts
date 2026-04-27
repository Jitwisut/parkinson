import * as SecureStore from "expo-secure-store";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:4000";

type ApiOptions = RequestInit & {
  patientId?: string;
  skipAuth?: boolean;
};

// Store token in SecureStore
export async function saveToken(token: string) {
  await SecureStore.setItemAsync("auth_token", token);
}

export async function getToken() {
  return await SecureStore.getItemAsync("auth_token");
}

export async function clearToken() {
  await SecureStore.deleteItemAsync("auth_token");
}

export async function saveUser(user: any) {
  await SecureStore.setItemAsync("auth_user", JSON.stringify(user));
}

export async function getUser() {
  try {
    const userStr = await SecureStore.getItemAsync("auth_user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

export async function clearUser() {
  await SecureStore.deleteItemAsync("auth_user");
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  
  if (!options.skipAuth) {
    const token = await getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      // Fallback dev headers in case token is missing and we allow dev auth
      headers.set("x-user-id", process.env.EXPO_PUBLIC_DEV_USER_ID || "dev-patient");
      headers.set("x-user-email", process.env.EXPO_PUBLIC_DEV_USER_EMAIL || "patient@example.com");
      headers.set("x-user-name", process.env.EXPO_PUBLIC_DEV_USER_NAME || "Dev Patient");
      headers.set("x-user-role", process.env.EXPO_PUBLIC_DEV_USER_ROLE || "PATIENT");
    }
  }

  // Include optional patient id if specified
  if (options.patientId) {
    headers.set("x-patient-id", options.patientId);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    let errorMsg = `API request failed with ${response.status}`;
    try {
      const parsed = JSON.parse(message);
      errorMsg = parsed.error || parsed.message || errorMsg;
    } catch (e) {
      errorMsg = message || errorMsg;
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export type SymptomPayload = {
  tremorLevel: number;
  rigidityLevel: number;
  walkingDifficulty: boolean;
  freezingGait: boolean;
  mood: number;
  energyLevel: number;
  note?: string;
  source?: "manual" | "sensor";
  recordedAt?: string;
};

export type Medication = {
  id: string;
  name: string;
  doseMg: number | null;
  times: string[];
  active: boolean;
};

export type MonthlyReport = {
  symptomCount: number;
  offEpisodeCount: number;
  medicationCompliance: number;
  symptoms: Array<{ tremorLevel: number; recordedAt: string }>;
};

export type TremorReading = {
  ax: number;
  ay: number;
  az: number;
  rms: number;
  recordedAt?: string;
};

export type TremorBaseline = {
  patientId: string;
  rmsBaseline: number;
  createdAt: string;
  updatedAt: string;
};

export type SensorReadingResponse = TremorReading & {
  id: string;
  patientId: string;
};

export const api = {
  // ── Auth APIs ──
  login: (data: any) =>
    request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),
  register: (data: any) =>
    request<{ token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),
  logout: () =>
    request<{ success: boolean; message: string }>("/auth/logout", {
      method: "POST",
    }),
    
  health: () => request<{ status: string; dependencies?: Record<string, string> }>("/health"),
  createSymptom: (payload: SymptomPayload) =>
    request("/symptoms", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listMedications: () => request<Medication[]>("/medications"),
  logMedication: (medicationId: string, status: "TAKEN" | "SKIPPED" | "MISSED") =>
    request(`/medications/${medicationId}/log`, {
      method: "POST",
      body: JSON.stringify({
        status,
        scheduledAt: new Date().toISOString(),
        takenAt: status === "TAKEN" ? new Date().toISOString() : null,
      }),
    }),
  getMonthlyReport: () => request<MonthlyReport>("/reports/monthly"),

  // ── Sensor APIs ──
  sendTremorReading: (payload: TremorReading) =>
    request<SensorReadingResponse>("/sensor/tremor", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getBaseline: () => request<TremorBaseline | null>("/sensor/tremor/baseline"),
  setBaseline: (rmsBaseline: number) =>
    request<TremorBaseline>("/sensor/tremor/baseline", {
      method: "POST",
      body: JSON.stringify({ rmsBaseline }),
    }),
  syncSteps: (stepCount: number, entryDate: string) =>
    request("/sensor/steps", {
      method: "POST",
      body: JSON.stringify({ stepCount, entryDate }),
    }),
};
