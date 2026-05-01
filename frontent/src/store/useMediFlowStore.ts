import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PatientInfo {
  name: string;
  email: string;
  age: string;
}

interface FormData {
  symptoms: string;
  severity: number;
  duration: string;
  additionalNotes: string;
}

interface MediFlowState {
  role: "patient" | "doctor" | null;
  patientInfo: PatientInfo;
  formData: FormData;
  sessionId: string;
  setRole: (role: "patient" | "doctor") => void;
  setPatientInfo: (info: PatientInfo) => void;
  setFormData: (data: FormData) => void;
  reset: () => void;
}

export const useMediFlowStore = create<MediFlowState>()(
  persist(
    (set) => ({
      role: null,
      patientInfo: { name: "", email: "", age: "" },
      formData: { symptoms: "", severity: 5, duration: "", additionalNotes: "" },
      sessionId: crypto.randomUUID(),
      setRole: (role) => set({ role }),
      setPatientInfo: (patientInfo) => set({ patientInfo }),
      setFormData: (formData) => set({ formData }),
      reset: () => set({
        role: null,
        patientInfo: { name: "", email: "", age: "" },
        formData: { symptoms: "", severity: 5, duration: "", additionalNotes: "" },
        sessionId: crypto.randomUUID()
      }),
    }),
    {
      name: "mediflow-session",
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => key !== "reset")
      ) as MediFlowState,
    }
  )
);
