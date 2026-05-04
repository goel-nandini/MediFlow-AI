import * as SecureStore from 'expo-secure-store';

/**
 * MediFlow AI — Mobile API Client
 *
 * Adapted for React Native / Expo using expo-secure-store.
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://mediflow-ai-1.onrender.com";

// ─── Token helpers ─────────────────────────────────────────────────────────────

async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync("mediflow_token");
  } catch (e) {
    console.error("Error reading token:", e);
    return null;
  }
}

export async function setToken(token: string) {
  await SecureStore.setItemAsync("mediflow_token", token);
}

export async function removeToken() {
  await SecureStore.deleteItemAsync("mediflow_token");
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Core request helper ───────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: HeadersInit
): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { ...headers, ...extraHeaders },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || `Request failed: ${res.status}`);
  }

  return data as T;
}

const get  = <T>(path: string)                   => request<T>("GET",    path);
const post = <T>(path: string, body: unknown)    => request<T>("POST",   path, body);
const put  = <T>(path: string, body: unknown)    => request<T>("PUT",    path, body);
const patch = <T>(path: string, body: unknown)   => request<T>("PATCH",  path, body);
const del  = <T>(path: string)                   => request<T>("DELETE", path);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AgentResult {
  state: string;
  nextQuestion?: string;
  done: boolean;
  triage?: {
    risk: string;
    confidence: number;
    reason: string;
    keySymptoms: string[];
  };
  decision?: {
    action: string;
    recommendation: string;
    specialistNeeded: string;
  };
}

export interface TriageStartResponse {
  success: boolean;
  sessionId: string;
  agentResult: AgentResult;
}

export interface TriageRespondResponse {
  success: boolean;
  agentResult: AgentResult;
}

export interface TriageSession {
  _id: string;
  patientName: string;
  sessionId: string;
  status: string;
  createdAt: string;
}

export interface Patient {
  _id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  bloodGroup?: string;
  phone?: string;
  conditions?: string[];
  medications?: string;
  allergies?: string;
  createdAt?: string;
}

export interface Appointment {
  _id: string;
  patientName?: string;
  patientId?: string;
  doctorId?: string;
  doctorName?: string;
  specialization?: string;
  clinicName?: string;
  dateTime?: string;
  status: string;
  fee?: string;
  reason?: string;
  createdAt?: string;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (data: { email: string; password: string }) =>
    post<AuthResponse>("/api/auth/login", data),

  register: (data: any) => post<AuthResponse>("/api/auth/register", data),

  me: () => get<{ success: boolean; user: AuthResponse["user"] }>("/api/auth/me"),
};

// ─── TRIAGE ───────────────────────────────────────────────────────────────────

export const triageApi = {
  start: (data: { symptoms: string; patientName: string; patientId?: string }) =>
    post<TriageStartResponse>("/api/triage/start", data),

  respond: (data: { sessionId: string; answer: string }) =>
    post<TriageRespondResponse>("/api/triage/respond", data),

  getSessions: (patientId?: string) => {
    const qs = patientId ? `?patientId=${patientId}` : "";
    return get<{ success: boolean; data: TriageSession[] }>(`/api/triage/sessions${qs}`);
  },
};

// ─── PATIENTS ─────────────────────────────────────────────────────────────────

export const patientsApi = {
  getById: (id: string) => get<{ success: boolean; patient: Patient }>(`/api/patients/${id}`),
};

// ─── DOCTORS ───────────────────────────────────────────────────────────────────

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  experience: number;
  qualifications: string[];
  clinicAddress: string;
  consultationFee: number;
  availability: {
    days: string[];
    timeSlots: string[];
  };
}

export const doctorsApi = {
  getAll: () => get<{ success: boolean; data: Doctor[] }>("/api/doctors"),
  getById: (id: string) => get<{ success: boolean; data: Doctor }>(`/api/doctors/${id}`),
};

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────

export const appointmentsApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return get<{ success: boolean; appointments: Appointment[] }>(`/api/appointments${qs}`);
  },
  getById: (id: string) => 
    get<{ success: boolean; data: Appointment }>(`/api/appointments/${id}`),
  create: (data: Partial<Appointment>) =>
    post<{ success: boolean; appointment: Appointment }>("/api/appointments", data),
};

// ── HEALTH HISTORY ────────────────────────────────────────────────────────────

export const healthHistoryApi = {
  getAll: (patientId: string) =>
    get<{ success: boolean; data: any[] }>(`/api/health-history?patientId=${patientId}`),
};

// ── RECORDS ───────────────────────────────────────────────────────────────────

export interface MedicalRecord {
  _id: string;
  type: string;
  title: string;
  description?: string;
  diagnosis?: string;
  doctor?: { name: string; _id: string };
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
  }>;
  recordDate: string;
}

export const recordsApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return get<{ success: boolean; count: number; data: MedicalRecord[] }>(`/api/records${qs}`);
  },
};

