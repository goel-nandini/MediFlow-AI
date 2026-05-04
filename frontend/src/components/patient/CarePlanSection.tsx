"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Brain, ShieldAlert, Stethoscope, Zap, CalendarClock,
  AlertTriangle, CheckCircle, Info
} from "lucide-react";
import { StepCard } from "./StepCard";
import { ActionList } from "./ActionList";
import { healthHistoryApi } from "@/lib/api";

interface CarePlan {
  summary: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  confidence: number;
  specialist: string;
  actions: string[];
  followUp: string;
  reason?: string;
  appointmentBooked?: boolean;
  bookedDoctor?: string;
}

/* ── default empty-state plan ── */
const DEFAULT_PLAN: CarePlan = {
  summary: "Complete your AI health assessment via the chat on the right to receive a personalised care plan.",
  risk: "LOW",
  confidence: 0,
  specialist: "General Physician",
  actions: [
    "Start a conversation with the AI assistant",
    "Describe your current symptoms in detail",
    "Answer the follow-up questions",
  ],
  followUp: "Your care plan will auto-populate once assessment is complete.",
  reason: "No assessment recorded yet.",
};

const riskConfig = {
  LOW: { label: "Low Risk", border: "border-l-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle size={16} />, step: "border-emerald-500" },
  MEDIUM: { label: "Medium Risk", border: "border-l-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200", icon: <AlertTriangle size={16} />, step: "border-amber-500" },
  HIGH: { label: "High Risk", border: "border-l-red-500", badge: "bg-red-50 text-red-700 border-red-200", icon: <ShieldAlert size={16} />, step: "border-red-500" },
};

function buildPlanFromHistory(record: Record<string, unknown>): CarePlan {
  const risk = (record.riskLevel as string || "").toLowerCase();
  const normalizedRisk: "LOW" | "MEDIUM" | "HIGH" =
    risk.includes("high") || risk.includes("critical") ? "HIGH"
      : risk.includes("moderate") || risk.includes("medium") ? "MEDIUM"
        : "LOW";

  const suggestions = (record.suggestions as string[]) || [];

  return {
    summary: (record.aiSummary as string) || `Based on your reported symptoms (${record.symptoms}), our AI has completed its assessment.`,
    risk: normalizedRisk,
    confidence: typeof record.confidence === "number" ? Math.round(record.confidence * 100) : 87,
    specialist: (record.specialist as string) || "General Physician",
    actions: suggestions.length > 0 ? suggestions : [
      "Rest and avoid physical exertion",
      "Stay hydrated — drink 8–10 glasses of water daily",
      "Monitor your symptoms every 4 hours",
      "Avoid self-medicating without professional advice",
      "Seek emergency care if symptoms worsen suddenly",
    ],
    followUp: record.appointmentBooked
      ? `✅ Appointment booked with ${record.bookedDoctor} (${record.bookedSpecialization}) on ${record.bookedTime}.`
      : normalizedRisk === "HIGH"
        ? "Seek medical attention immediately or within the next 24 hours."
        : normalizedRisk === "MEDIUM"
          ? "Book an appointment within the next 2–3 days."
          : "Schedule a routine check-up within the next 1–2 weeks.",
    reason: (record.severity as string) || undefined,
    appointmentBooked: record.appointmentBooked as boolean,
    bookedDoctor: record.bookedDoctor as string,
  };
}

export function CarePlanSection() {
  const router = useRouter();
  const [plan, setPlan] = useState<CarePlan>(DEFAULT_PLAN);
  const [hasData, setHasData] = useState(false);

  const loadPlan = async () => {
    try {
      const u = JSON.parse(localStorage.getItem("mediflow_user") || "{}");
      if (u?.id) {
        const res = await healthHistoryApi.getAll(u.id);
        const history = res.data?.filter((r: any) => r.type === "assessment");
        if (history && history.length > 0) {
          setPlan(buildPlanFromHistory(history[0]));
          setHasData(true);
          return;
        }
      }
    } catch { /* ignore */ }
    setPlan(DEFAULT_PLAN);
    setHasData(false);
  };

  useEffect(() => {
    loadPlan();
    window.addEventListener("healthHistoryUpdated", loadPlan);
    window.addEventListener("healthUpdated", loadPlan);
    return () => {
      window.removeEventListener("healthHistoryUpdated", loadPlan);
      window.removeEventListener("healthUpdated", loadPlan);
    };
  }, []);

  const risk = riskConfig[plan.risk];

  return (
    <section className="mt-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[#64748B] text-sm font-medium mb-1">AI-Generated</p>
          <h3 className="text-[#0F172A] text-xl font-bold">Your Care Plan</h3>
        </div>
        {hasData && (
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <CheckCircle size={13} /> Assessment Complete
          </span>
        )}
      </div>

      {/* Empty-state notice */}
      {!hasData && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
          <Info size={18} className="shrink-0 mt-0.5 text-blue-600" />
          <p>Use the <strong>Clinical Triage Chat</strong> on this page to describe your symptoms. Once the AI completes its assessment, your personalised care plan will appear here automatically.</p>
        </div>
      )}

      {/* Step Flow */}
      <div>

        {/* Step 1 — AI Assessment */}
        <StepCard step={1} icon={<Brain size={17} />} title="AI Assessment">
          <p className="text-[#475569] text-[14px] leading-relaxed">{plan.summary}</p>
          {hasData && plan.reason && (
            <div className="mt-3 flex items-start gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3">
              <Info size={15} className="text-[#94A3B8] shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#64748B]"><strong className="text-[#334155]">Why this?</strong> {plan.reason}</p>
            </div>
          )}
          {hasData && (
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div className="h-full bg-[#1B4965] rounded-full" style={{ width: `${plan.confidence}%` }} />
              </div>
              <span className="text-[12px] font-bold text-[#64748B] shrink-0">Confidence {plan.confidence}%</span>
            </div>
          )}
        </StepCard>

        {/* Step 2 — Risk Level */}
        <StepCard step={2} icon={<ShieldAlert size={17} />} title="Risk Level" accent={risk.step}>
          <div className={`flex items-center gap-3 border-l-4 ${risk.border} pl-4 py-1`}>
            <span className={`flex items-center gap-1.5 text-[13px] font-bold px-3 py-1.5 rounded-full border ${risk.badge}`}>
              {risk.icon} {risk.label}
            </span>
            {hasData && (
              <p className="text-[13px] text-[#64748B]">
                {plan.risk === "HIGH" ? "Requires immediate medical attention." :
                  plan.risk === "MEDIUM" ? "Monitor closely and consult a doctor soon." :
                    "Manageable with self-care and routine follow-up."}
              </p>
            )}
          </div>
        </StepCard>

        {/* Step 3 — Recommended Specialist */}
        <StepCard step={3} icon={<Stethoscope size={17} />} title="Recommended Specialist">
          <div className="flex items-center gap-4 bg-[#F0F7FC] border border-[#BFDBF7] rounded-xl p-4">
            <div className="w-11 h-11 rounded-full bg-[#1B4965] flex items-center justify-center shrink-0">
              <Stethoscope size={20} color="white" />
            </div>
            <div>
              <p className="text-[#0F172A] font-bold text-[15px]">{plan.specialist}</p>
              <p className="text-[#64748B] text-[13px]">Recommended based on your symptom profile</p>
            </div>
          </div>
        </StepCard>

        {/* Step 4 — Immediate Actions */}
        <StepCard step={4} icon={<Zap size={17} />} title="Immediate Actions">
          <ActionList actions={plan.actions} />
        </StepCard>

        {/* Step 5 — Follow-up Plan */}
        <StepCard step={5} icon={<CalendarClock size={17} />} title="Follow-up Plan" isLast>
          <p className="text-[#475569] text-[14px] mb-4 leading-relaxed">{plan.followUp}</p>
          {plan.appointmentBooked ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[14px] font-bold px-5 py-3 rounded-xl">
              <CheckCircle size={16} />
              Appointment Booked with {plan.bookedDoctor}!
            </div>
          ) : (
            <button
              onClick={() => router.push("/demo/patient/appointments")}
              className="flex items-center gap-2 bg-[#1B4965] text-white text-[14px] font-bold px-5 py-3 rounded-xl hover:bg-[#163d52] transition-colors shadow-sm"
            >
              <CalendarClock size={16} />
              Book Appointment
            </button>
          )}
        </StepCard>

      </div>
    </section>
  );
}
