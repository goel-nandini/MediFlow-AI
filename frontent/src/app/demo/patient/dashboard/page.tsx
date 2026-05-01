"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, FileText, Stethoscope, Zap, Phone, Video, Calendar, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { PageContainer } from "../../../../components/ui/PageContainer";
import { Card } from "../../../../components/ui/Card";
import { Badge } from "../../../../components/ui/Badge";
import { DemoNavbar } from "../../../../components/layout/DemoNavbar";
import { Skeleton } from "../../../../components/ui/Skeleton";
import { useMediFlowStore } from "../../../../store/useMediFlowStore";

function getRiskLevel(severity: number, symptoms: string): {
  level: "emergency" | "high" | "moderate" | "normal";
  label: string;
  advice: string;
  specialist: string;
  specialistReason: string;
  nextAction: string;
  waitTime: string;
  color: string;
} {
  const s = symptoms.toLowerCase();
  const hasChest = s.includes("chest") || s.includes("heart");
  const hasBreath = s.includes("breath") || s.includes("breathing");
  const hasFever = s.includes("fever") || s.includes("temperature");
  const hasHead = s.includes("head") || s.includes("migraine");

  if (severity >= 8 || (severity >= 6 && (hasChest || hasBreath))) {
    return {
      level: "emergency",
      label: "EMERGENCY",
      advice: "Seek immediate emergency care. Do not drive yourself.",
      specialist: "Emergency Medicine",
      specialistReason: "High severity with critical symptom indicators detected.",
      nextAction: "Call 112 or go to nearest Emergency Room immediately",
      waitTime: "Immediate",
      color: "danger",
    };
  } else if (severity >= 6 || hasChest || hasBreath) {
    return {
      level: "high",
      label: "HIGH PRIORITY",
      advice: "See a doctor within 2–4 hours. Monitor symptoms closely.",
      specialist: hasChest ? "Cardiologist" : "General Physician",
      specialistReason: "Symptom pattern suggests urgent evaluation needed.",
      nextAction: "Book urgent appointment or visit walk-in clinic",
      waitTime: "Within 4 hours",
      color: "warning",
    };
  } else if (severity >= 4 || hasFever || hasHead) {
    return {
      level: "moderate",
      label: "MODERATE",
      advice: "Schedule a doctor visit within 24–48 hours.",
      specialist: hasFever ? "General Physician" : hasHead ? "Neurologist" : "General Physician",
      specialistReason: "Symptoms require professional evaluation but are not immediately critical.",
      nextAction: "Book appointment within 48 hours",
      waitTime: "24–48 hours",
      color: "warning",
    };
  } else {
    return {
      level: "normal",
      label: "LOW RISK",
      advice: "Monitor symptoms. Rest and stay hydrated.",
      specialist: "General Physician",
      specialistReason: "Symptoms appear mild. Routine consultation recommended.",
      nextAction: "Schedule routine appointment or use telemedicine",
      waitTime: "Within a week",
      color: "success",
    };
  }
}

export default function PatientDashboardPage() {
  const router = useRouter();
  const { patientInfo, formData, sessionId, reset } = useMediFlowStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientInfo.name || !formData.symptoms) {
      router.replace("/demo/patient/auth");
      return;
    }
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [patientInfo.name, formData.symptoms, router]);

  if (!patientInfo.name || !formData.symptoms) return null;

  const risk = getRiskLevel(formData.severity, formData.symptoms);
  const now = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' });
  const shortId = sessionId.substring(0, 6);

  // Gauge calculations
  const radius = 70;
  const circumference = Math.PI * radius;
  const dash = (formData.severity / 10) * circumference;
  const fillClass = risk.level === 'emergency' ? 'text-danger' :
    risk.level === 'high' || risk.level === 'moderate' ? 'text-warning' : 'text-success';

  if (loading) {
    return (
      <>
        <DemoNavbar title="Your Health Report" step={3} totalSteps={3} />
        <PageContainer maxWidth="xl" className="flex flex-col items-center justify-center pt-24">
          <div className="flex flex-col items-center gap-3 mb-10 animate-pulse">
            <Bot className="text-accent" size={32} />
            <h2 className="font-display font-bold text-xl text-primary">MediFlow AI is preparing your report...</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-5xl">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton lines={4} className="h-40" />
              <Skeleton lines={6} className="h-64" />
            </div>
            <div className="lg:col-span-1 space-y-6">
              <Skeleton lines={3} className="h-48" />
              <Skeleton lines={2} className="h-32" />
            </div>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <DemoNavbar title="Your Health Report" step={3} totalSteps={3} />
      <PageContainer maxWidth="xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            <Card padding="lg" className="animate-fadeUp" style={{ animationDelay: '0ms' }}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <p className="text-accent text-xs font-bold uppercase tracking-widest">
                    AI HEALTH REPORT
                  </p>
                  <h2 className="font-display text-2xl text-primary font-bold mt-1">
                    Hello, {patientInfo.name}. Here's your assessment.
                  </h2>
                  <p className="text-secondary text-sm mt-1">
                    Generated by MediFlow AI · {now} · Session #{shortId}
                  </p>
                </div>
                <Badge variant={risk.level === 'high' ? 'high' : risk.level === 'emergency' ? 'emergency' : risk.level === 'moderate' ? 'moderate' : 'normal'} pulse size="md" className="shrink-0 self-start">
                  {risk.label}
                </Badge>
              </div>
              <div className="border-t border-bgSoft mt-5 pt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5 text-primary/40 text-xs font-medium">
                  <Clock size={14} /> Analyzed in 2.4s
                </div>
                <div className="w-1 h-1 bg-bgSoft rounded-full" />
                <div className="flex items-center gap-1.5 text-primary/40 text-xs font-medium">
                  <ShieldCheck size={14} /> Clinically validated protocols
                </div>
              </div>
            </Card>

            <Card padding="lg" className="animate-fadeUp" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 mb-5">
                <Bot className="text-accent" size={24} />
                <h3 className="font-display text-lg text-primary font-bold">AI Clinical Analysis</h3>
              </div>

              <div className="bg-bgLight/50 rounded-2xl rounded-tl-none p-5 text-sm text-primary leading-relaxed font-medium">
                "Based on your reported symptoms of <span className="italic">'{formData.symptoms.substring(0, 80)}{formData.symptoms.length > 80 ? '...' : ''}'</span> with a severity of {formData.severity}/10 and duration of {formData.duration || "unspecified time"}, MediFlow AI has identified this as a <span className="font-bold">{risk.label}</span> situation. {risk.advice}"
              </div>

              <div className="mt-5 bg-bgSoft/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">AI Confidence Score</span>
                  <Badge variant="low">87%</Badge>
                </div>
                <div className="h-1.5 bg-bgLight rounded-full w-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent w-[87%] rounded-full" />
                </div>
              </div>
            </Card>

            <Card padding="lg" className="animate-fadeUp" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 mb-5">
                <FileText className="text-secondary" size={20} />
                <h3 className="font-display text-lg text-primary font-bold">Symptom Summary</h3>
              </div>

              <div className="divide-y divide-bgSoft/50 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 py-3 gap-1 sm:gap-4">
                  <span className="text-primary/60 font-medium">Primary Symptoms</span>
                  <span className="sm:col-span-2 italic text-primary/90">{formData.symptoms}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 py-3 gap-1 sm:gap-4">
                  <span className="text-primary/60 font-medium">Severity Level</span>
                  <span className="sm:col-span-2 font-bold flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${risk.level === 'emergency' ? 'bg-danger' : risk.level === 'high' ? 'bg-warning' : risk.level === 'moderate' ? 'bg-yellow-500' : 'bg-success'}`} />
                    {formData.severity} / 10
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 py-3 gap-1 sm:gap-4">
                  <span className="text-primary/60 font-medium">Duration</span>
                  <span className="sm:col-span-2 font-medium">{formData.duration || "Not specified"}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 py-3 gap-1 sm:gap-4">
                  <span className="text-primary/60 font-medium">Additional Info</span>
                  <span className={`sm:col-span-2 ${!formData.additionalNotes ? "text-primary/40 italic" : "font-medium"}`}>
                    {formData.additionalNotes || "None provided"}
                  </span>
                </div>
              </div>
            </Card>

            <Card padding="lg" className="animate-fadeUp" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-2 mb-5">
                <Zap className="text-warning" size={20} />
                <h3 className="font-display text-lg text-primary font-bold">Next Steps</h3>
              </div>

              <div className="bg-primary rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">
                  Recommended Action
                </p>
                <p className="font-display text-xl sm:text-2xl font-bold">
                  {risk.nextAction}
                </p>
                <button className="mt-5 bg-white text-primary hover:bg-bgLight transition-colors font-bold rounded-xl px-6 py-3 text-sm inline-flex items-center gap-2 shadow-sm">
                  Take Action Now <ArrowRight size={16} />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <Card padding="sm" hover className="flex items-center gap-4 bg-bgLight/30 border-transparent hover:border-bgSoft">
                  <div className="bg-success/10 text-success rounded-lg p-2.5">
                    <Phone size={20} />
                  </div>
                  <div className="flex-1 font-semibold text-sm text-primary">Call Emergency: 112</div>
                  <ArrowRight size={16} className="text-primary/30" />
                </Card>
                <Card padding="sm" hover className="flex items-center gap-4 bg-bgLight/30 border-transparent hover:border-bgSoft">
                  <div className="bg-accent/10 text-accent rounded-lg p-2.5">
                    <Video size={20} />
                  </div>
                  <div className="flex-1 font-semibold text-sm text-primary">Start Telemedicine Consult</div>
                  <ArrowRight size={16} className="text-primary/30" />
                </Card>
                <Card padding="sm" hover className="flex items-center gap-4 bg-bgLight/30 border-transparent hover:border-bgSoft">
                  <div className="bg-secondary/10 text-secondary rounded-lg p-2.5">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1 font-semibold text-sm text-primary">Book Appointment</div>
                  <ArrowRight size={16} className="text-primary/30" />
                </Card>
              </div>
            </Card>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">

            <Card padding="lg" className="animate-fadeUp flex flex-col items-center" style={{ animationDelay: '100ms' }}>
              <h3 className="font-display text-base text-primary font-bold w-full mb-6">Risk Assessment</h3>

              <div className="relative w-40 h-24 overflow-hidden mb-2">
                <svg viewBox={`0 0 160 80`} className="w-full h-full overflow-visible">
                  <path
                    d="M 10 70 A 60 60 0 0 1 150 70"
                    fill="none"
                    stroke="#BEE9E8"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 70 A 60 60 0 0 1 150 70"
                    fill="none"
                    stroke="currentColor"
                    className={fillClass}
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - dash}
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <div className="absolute bottom-0 left-0 w-full text-center flex flex-col items-center">
                  <span className="font-display font-bold text-4xl text-primary leading-none">
                    {formData.severity}<span className="text-lg text-primary/40">/10</span>
                  </span>
                </div>
              </div>

              <Badge variant={risk.level === 'high' ? 'high' : risk.level === 'emergency' ? 'emergency' : risk.level === 'moderate' ? 'moderate' : 'normal'} size="md" className="mt-4">
                {risk.label}
              </Badge>

              <div className="w-full grid grid-cols-3 gap-2 mt-8 border-t border-bgSoft pt-4">
                <div className="flex flex-col items-center text-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent mb-1" />
                  <span className="text-[10px] text-primary/50 uppercase font-bold tracking-wider">Severity</span>
                  <span className="text-xs font-bold text-primary">{formData.severity}/10</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary mb-1" />
                  <span className="text-[10px] text-primary/50 uppercase font-bold tracking-wider">Duration</span>
                  <span className="text-xs font-bold text-primary truncate max-w-full">{formData.duration ? formData.duration.split(" ")[0] : "N/A"}</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <span className={`w-2 h-2 rounded-full mb-1 ${risk.level === 'emergency' ? 'bg-danger' : risk.level === 'high' ? 'bg-warning' : risk.level === 'moderate' ? 'bg-yellow-500' : 'bg-success'}`} />
                  <span className="text-[10px] text-primary/50 uppercase font-bold tracking-wider">Risk</span>
                  <span className="text-xs font-bold text-primary">{risk.level === 'emergency' ? 'High' : 'Low'}</span>
                </div>
              </div>
            </Card>

            <Card padding="lg" className="animate-fadeUp" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="text-secondary" size={20} />
                <h3 className="font-display text-base text-primary font-bold">Recommended Specialist</h3>
              </div>

              <p className="font-display text-2xl text-primary font-bold mt-1">
                {risk.specialist}
              </p>
              <p className="text-xs text-secondary mt-2 leading-relaxed font-medium">
                {risk.specialistReason}
              </p>

              <div className="border-t border-bgSoft my-4" />

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Clock size={16} className="text-accent" />
                  Wait Time
                </div>
                <Badge variant="low" size="sm" className="bg-bgLight font-bold">
                  {risk.waitTime}
                </Badge>
              </div>

              <div className="bg-bgLight/60 rounded-xl p-4 flex items-center gap-3 border border-bgSoft/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shrink-0">
                  Dr
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-primary text-sm truncate">Dr. Priya Sharma</p>
                  <p className="text-secondary text-[10px] uppercase font-bold tracking-wider truncate">{risk.specialist}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-warning text-xs tracking-tighter">★★★★★</div>
                  <div className="text-primary/60 text-[10px] font-bold">4.9 (120)</div>
                </div>
              </div>
            </Card>

            <Card padding="lg" className="animate-fadeUp" style={{ animationDelay: '300ms' }}>
              <h3 className="font-display text-base text-primary font-bold mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <button className="w-full py-3 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-secondary transition-colors shadow-sm active:scale-[0.98]">
                  Book Appointment
                </button>
                <button
                  onClick={() => {
                    reset();
                    router.push("/demo");
                  }}
                  className="w-full py-3 bg-bgSoft text-primary font-semibold rounded-xl text-sm border border-bgLight hover:bg-bgLight transition-colors active:scale-[0.98]"
                >
                  Start New Assessment
                </button>
                <button className="w-full py-3 bg-transparent text-primary font-semibold rounded-xl text-sm border-2 border-primary hover:bg-primary hover:text-white transition-colors shadow-none active:scale-[0.98]">
                  Share Report
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-bgSoft text-center">
                <p className="text-[10px] text-primary/40 font-medium leading-relaxed uppercase tracking-wider">
                  This is a demo report.<br />Always consult a qualified physician.
                </p>
              </div>
            </Card>

          </div>
        </div>
      </PageContainer>
    </>
  );
}
