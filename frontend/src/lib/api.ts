/**
 * MediFlow AI — Centralized API Client
 *
 * All calls to the backend go through this file.
 * DO NOT put any database logic or server-side code in the frontend.
 * Token is read from localStorage key 'mediflow_token'.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Token helpers ─────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  // Use doctor token when on doctor portal pages, patient token otherwise
  const path = window.location.pathname;
  if (path.startsWith("/demo/doctor") || path.startsWith("/doctor")) {
    return localStorage.getItem("mediflow_doctor_token") || localStorage.getItem("mediflow_token");
  }
  if (path.startsWith("/demo/admin") || path.startsWith("/admin")) {
    return localStorage.getItem("mediflow_admin_token") || localStorage.getItem("mediflow_token");
  }
  return localStorage.getItem("mediflow_token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
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
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { ...authHeaders(), ...extraHeaders },
    cache: 'no-store',
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

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  email?: string;
  phone?: string;
  available: boolean;
  patients?: number;
  rating?: number;
  fee?: string;
  location?: string;
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

export interface DashboardSummary {
  totalPatients: number;
  todayAppointments: number;
  emergencyPatients: number;
  availableDoctors: number;
}

export interface MonthlyVisit {
  month: string;
  visits: number;
}

export interface CaseDistribution {
  name: string;
  value: number;
  color?: string;
}

export interface DoctorLoad {
  name: string;
  patients: number;
}

export interface Prompt {
  _id: string;
  name: string;
  content: string;
  updatedAt?: string;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    age?: string;
    height?: string;
    weight?: string;
    bloodGroup?: string;
    gender?: string;
    conditions?: string[];
    medications?: string;
    allergies?: string;
  }) => post<AuthResponse>("/api/auth/register", data),

  registerDoctor: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    specialization: string;
    qualification?: string;
    experience?: number;
    department?: string;
    consultationFee?: number;
  }) => post<AuthResponse>("/api/auth/register-doctor", data),

  login: (data: { email: string; password: string; platform?: string }) => {
    // Determine platform based on current URL path if not provided
    let platform = data.platform || 'patient';
    if (!data.platform && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/demo/doctor') || path.startsWith('/doctor')) {
        platform = 'doctor';
      } else if (path.startsWith('/demo/admin') || path.startsWith('/admin')) {
        platform = 'admin';
      }
    }
    return post<AuthResponse>("/api/auth/login", { email: data.email, password: data.password, platform });
  },

  me: () => get<{ success: boolean; user: AuthResponse["user"] }>("/api/auth/me"),
};

// ─── TRIAGE ───────────────────────────────────────────────────────────────────

export const triageApi = {
  /** Start a new triage session */
  start: (data: { symptoms: string; patientName: string }) =>
    post<TriageStartResponse>("/api/triage/start", data),

  /** Submit an answer and get next question (or final result when done===true) */
  respond: (data: { sessionId: string; answer: string }) =>
    post<TriageRespondResponse>("/api/triage/respond", data),

  /** Get all triage sessions */
  getSessions: () => get<{ success: boolean; sessions: TriageSession[] }>("/api/triage/sessions"),
};

// ─── PATIENTS ─────────────────────────────────────────────────────────────────

export const patientsApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return get<{ success: boolean; patients: Patient[] }>(`/api/patients${qs}`);
  },
  create:  (data: Partial<Patient>) => post<{ success: boolean; patient: Patient }>("/api/patients", data),
  getById: (id: string)             => get<{ success: boolean; patient: Patient }>(`/api/patients/${id}`),
  update:  (id: string, data: Partial<Patient>) => put<{ success: boolean; patient: Patient }>(`/api/patients/${id}`, data),
  delete:  (id: string)             => del<{ success: boolean }>(`/api/patients/${id}`),
};

// ─── DOCTORS ──────────────────────────────────────────────────────────────────

export const doctorsApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return get<{ success: boolean; doctors: Doctor[] }>(`/api/doctors${qs}`);
  },
  create:           (data: Partial<Doctor>) => post<{ success: boolean; doctor: Doctor }>("/api/doctors", data),
  getById:          (id: string)            => get<{ success: boolean; doctor: Doctor }>(`/api/doctors/${id}`),
  update:           (id: string, data: Partial<Doctor>) => put<{ success: boolean; doctor: Doctor }>(`/api/doctors/${id}`, data),
  updateAvailability: (id: string, available: boolean) =>
    patch<{ success: boolean; doctor: Doctor }>(`/api/doctors/${id}/availability`, { available }),
};

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────

export const appointmentsApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return get<{ success: boolean; appointments: Appointment[] }>(`/api/appointments${qs}`);
  },
  getToday: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return get<{ success: boolean; appointments: Appointment[] }>(`/api/appointments/today${qs}`);
  },
  getById: (id: string) => 
    get<{ success: boolean; data: Appointment }>(`/api/appointments/${id}`),
  create: (data: Partial<Appointment>) =>
    post<{ success: boolean; appointment: Appointment }>("/api/appointments", data),
  update: (id: string, data: Partial<Appointment>) =>
    put<{ success: boolean; appointment: Appointment }>(`/api/appointments/${id}`, data),
  delete: (id: string) =>
    del<{ success: boolean }>(`/api/appointments/${id}`),
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  summary: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return get<{ success: boolean; data: { stats: DashboardSummary } }>(`/api/dashboard/summary${qs}`);
  },
  monthlyVisits: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return get<{ success: boolean; data: MonthlyVisit[] }>(`/api/dashboard/monthly-visits${qs}`);
  },
  caseDistribution: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return get<{ success: boolean; data: CaseDistribution[] }>(`/api/dashboard/case-distribution${qs}`);
  },
  doctorLoad: () => get<{ success: boolean; data: DoctorLoad[] }>("/api/dashboard/doctor-load"),
};

// ─── PROMPTS ──────────────────────────────────────────────────────────────────

export const promptsApi = {
  getAll:  ()                                    => get<{ success: boolean; prompts: Prompt[] }>("/api/prompts"),
  update:  (id: string, content: string)         => put<{ success: boolean; prompt: Prompt }>(`/api/prompts/${id}`, { content }),
};

// ── HEALTH HISTORY ────────────────────────────────────────────────────────────

export const healthHistoryApi = {
  getAll: (patientId: string) =>
    get<{ success: boolean; data: any[] }>(`/api/health-history?patientId=${patientId}`),
  create: (data: any) =>
    post<{ success: boolean; data: any }>("/api/health-history", data),
  update: (id: string, data: any) =>
    put<{ success: boolean; data: any }>(`/api/health-history/${id}`, data),
};

