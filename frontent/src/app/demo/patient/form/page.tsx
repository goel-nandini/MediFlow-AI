"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, ChevronDown, Bot } from "lucide-react";
import { PageContainer } from "../../../../components/ui/PageContainer";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { InputField } from "../../../../components/ui/InputField";
import { DemoNavbar } from "../../../../components/layout/DemoNavbar";
import { useMediFlowStore } from "../../../../store/useMediFlowStore";

const COMMON_SYMPTOMS = [
  "Chest Pain", "Shortness of Breath", "Fever", "Headache",
  "Nausea", "Fatigue", "Back Pain", "Dizziness"
];

const DURATIONS = [
  "Select duration",
  "Less than 1 hour",
  "1–6 hours",
  "6–24 hours",
  "1–3 days",
  "3–7 days",
  "More than a week",
  "Chronic / Ongoing"
];

export default function PatientFormPage() {
  const router = useRouter();
  const { patientInfo, setFormData } = useMediFlowStore();

  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState(5);
  const [duration, setDuration] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!patientInfo.name) {
      router.replace("/demo/patient/auth");
    }
  }, [patientInfo.name, router]);

  const handleAddSymptomTag = (tag: string) => {
    const newSymptoms = symptoms ? `${symptoms}, ${tag}` : tag;
    setSymptoms(newSymptoms);
  };

  const getSeverityBadge = () => {
    if (severity <= 3) return { label: "Normal", color: "bg-success/10 text-success border-success/30" };
    if (severity <= 6) return { label: "Moderate", color: "bg-yellow-50 text-yellow-700 border-yellow-200" };
    if (severity <= 8) return { label: "High", color: "bg-warning/10 text-warning border-warning/30" };
    return { label: "Emergency", color: "bg-danger/10 text-danger border-danger/30" };
  };

  const badgeProps = getSeverityBadge();

  const handleSubmit = () => {
    setIsProcessing(true);
    setFormData({ symptoms, severity, duration: duration === "Select duration" ? "" : duration, additionalNotes });
    setTimeout(() => {
      router.push("/demo/patient/dashboard");
    }, 2500);
  };

  if (!patientInfo.name) return null;

  return (
    <>
      <DemoNavbar showBack backHref="/demo/patient/auth" title="Symptom Check" step={2} totalSteps={3} />
      <PageContainer maxWidth="md">

        <Card glass padding="md" className="mb-6 animate-fadeIn flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white font-bold font-display text-sm rounded-full w-9 h-9 flex items-center justify-center uppercase shrink-0">
              {patientInfo.name.charAt(0)}
            </div>
            <p className="text-primary font-semibold text-sm">
              Welcome back, {patientInfo.name}! Let's assess your symptoms.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 shrink-0 bg-success/10 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            <span className="text-success text-xs font-semibold">Session active</span>
          </div>
        </Card>

        <Card padding="lg" className="animate-fadeUp">
          <div className="flex items-center gap-2">
            <Activity className="text-accent" size={24} />
            <h2 className="font-display text-xl text-primary font-bold">
              Symptom Assessment
            </h2>
          </div>
          <p className="text-secondary text-sm mt-1">
            Fill in as much detail as possible for accurate AI triage
          </p>
          <div className="border-t border-bgSoft mt-4 mb-6" />

          <div className="space-y-6">
            {/* Field 1: Symptoms */}
            <div>
              <label className="text-sm font-semibold text-primary mb-1.5 flex items-center">
                What are your primary symptoms? <span className="text-danger ml-1">*</span>
              </label>
              <div className="relative">
                <textarea
                  className="w-full bg-bgLight/60 border border-bgSoft rounded-xl px-4 py-3 h-28 resize-none text-primary text-sm placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-accent transition"
                  placeholder="Describe your symptoms in detail, e.g. 'Severe chest pain radiating to left arm, shortness of breath, started 2 hours ago...'"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value.substring(0, 500))}
                  maxLength={500}
                />
                <span className="absolute bottom-3 right-3 text-xs text-primary/30 font-medium">
                  {symptoms.length}/500
                </span>
              </div>

              <div className="mt-3">
                <p className="text-xs text-primary/60 mb-2 font-medium">Common symptoms — tap to add:</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOMS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleAddSymptomTag(tag)}
                      className="bg-bgSoft border border-bgLight text-primary text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-accent hover:text-white hover:border-accent transition-all duration-200 font-medium"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Field 2: Severity */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-primary">
                  Pain / Discomfort Severity <span className="text-danger">*</span>
                </label>
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide inline-flex items-center rounded-full border ${badgeProps.color}`}>
                  {severity} — {badgeProps.label}
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={severity}
                onChange={(e) => setSeverity(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer border border-bgSoft/50"
                style={{
                  accentColor: "#62B6CB",
                  background: `linear-gradient(to right, #62B6CB ${(severity - 1) * 11.11}%, #BEE9E8 ${(severity - 1) * 11.11}%)`
                }}
              />
              <div className="flex justify-between mt-2 px-1">
                <span className="text-xs font-medium text-primary/40">1 Minimal</span>
                <span className="text-xs font-medium text-primary/40">10 Severe</span>
              </div>
            </div>

            {/* Field 3: Duration */}
            <div>
              <label className="text-sm font-semibold text-primary mb-1.5 block">
                How long have you had these symptoms?
              </label>
              <div className="relative">
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-bgLight/60 border border-bgSoft rounded-xl px-4 py-3 text-primary text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent transition font-medium"
                >
                  {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" size={18} />
              </div>
            </div>

            {/* Field 4: Additional */}
            <div>
              <InputField
                label="Any additional information?"
                placeholder="e.g. Diabetic, on metformin, allergic to penicillin"
                hint="Existing conditions, medications, allergies — helps AI accuracy"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
              />
            </div>

            <div className="mt-6 bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 items-start">
              <Bot className="text-accent shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-primary/70 leading-relaxed">
                MediFlow AI will analyze your input using clinical triage protocols. Results are indicative only — always consult a qualified physician.
              </p>
            </div>

            {isProcessing ? (
              <Card padding="md" className="bg-primary border-primary mt-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-5 h-5" />
                    <p className="text-white font-semibold text-sm">MediFlow AI is analyzing your symptoms...</p>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-accent via-white/80 to-accent shimmer-bg animate-shimmer" />
                  </div>
                  <p className="text-center text-white/60 text-xs mt-3 font-medium">
                    Checking clinical protocols · Assessing risk factors · Generating report
                  </p>
                </div>
              </Card>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full mt-6"
                disabled={symptoms.trim().length < 10}
                onClick={handleSubmit}
              >
                Analyze My Symptoms →
              </Button>
            )}

          </div>
        </Card>
      </PageContainer>
    </>
  );
}
