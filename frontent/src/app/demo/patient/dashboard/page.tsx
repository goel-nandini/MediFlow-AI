"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot, FileText, Stethoscope, Zap, Phone, Video, Calendar,
  ArrowRight, Clock, ShieldCheck, BarChart2, HeartPulse, Lightbulb,
  CheckCircle, AlertTriangle, User, Activity
} from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import { Badge } from "../../../../components/ui/Badge";
import { DemoNavbar } from "../../../../components/layout/DemoNavbar";
import { Skeleton } from "../../../../components/ui/Skeleton";
import { PatientSidebar, type PatientTab } from "../../../../components/patient/PatientSidebar";
import { SeverityBarChart } from "../../../../components/patient/SeverityBarChart";
import { HealthPieChart } from "../../../../components/patient/HealthPieChart";
import { TrendLineChart } from "../../../../components/patient/TrendLineChart";
import { ConsultEffectivenessChart } from "../../../../components/patient/ConsultEffectivenessChart";
import { useMediFlowStore } from "../../../../store/useMediFlowStore";

function getRiskLevel(severity: number, symptoms: string) {
  const s = symptoms.toLowerCase();
  const hasChest = s.includes("chest") || s.includes("heart");
  const hasBreath = s.includes("breath");
  const hasFever = s.includes("fever");
  const hasHead = s.includes("head") || s.includes("migraine");

  if (severity >= 8 || (severity >= 6 && (hasChest || hasBreath))) {
    return { level: "emergency" as const, label: "EMERGENCY", advice: "Seek immediate emergency care. Do not drive yourself.", specialist: "Emergency Medicine", specialistReason: "High severity with critical symptom indicators detected.", nextAction: "Call 112 or go to nearest Emergency Room immediately", waitTime: "Immediate", color: "danger" };
  } else if (severity >= 6 || hasChest || hasBreath) {
    return { level: "high" as const, label: "HIGH PRIORITY", advice: "See a doctor within 2–4 hours. Monitor symptoms closely.", specialist: hasChest ? "Cardiologist" : "General Physician", specialistReason: "Symptom pattern suggests urgent evaluation needed.", nextAction: "Book urgent appointment or visit walk-in clinic", waitTime: "Within 4 hours", color: "warning" };
  } else if (severity >= 4 || hasFever || hasHead) {
    return { level: "moderate" as const, label: "MODERATE", advice: "Schedule a doctor visit within 24–48 hours.", specialist: hasFever ? "General Physician" : hasHead ? "Neurologist" : "General Physician", specialistReason: "Symptoms require professional evaluation but are not immediately critical.", nextAction: "Book appointment within 48 hours", waitTime: "24–48 hours", color: "warning" };
  }
  return { level: "normal" as const, label: "LOW RISK", advice: "Monitor symptoms. Rest and stay hydrated.", specialist: "General Physician", specialistReason: "Symptoms appear mild. Routine consultation recommended.", nextAction: "Schedule routine appointment or use telemedicine", waitTime: "Within a week", color: "success" };
}

function StatCard({ label, value, sub, dotColor }: { label: string; value: string; sub?: string; dotColor: string }) {
  return (
    <div className="bg-bgLight/50 rounded-xl p-4 border border-bgSoft/50 flex flex-col gap-1">
      <span className="text-xs font-bold text-primary/40 uppercase tracking-wider">{label}</span>
      <span className="font-display font-bold text-primary text-xl flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />{value}
      </span>
      {sub && <span className="text-xs text-secondary font-medium">{sub}</span>}
    </div>
  );
}

export default function PatientDashboardPage() {
  const router = useRouter();
  const { patientInfo, formData, healthHistory, sessionId, reset } = useMediFlowStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PatientTab>("overview");

  useEffect(() => {
    if (!patientInfo.name || !formData.symptoms) {
      router.replace("/demo/patient/auth");
      return;
    }
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, [patientInfo.name, formData.symptoms, router]);

  if (!patientInfo.name || !formData.symptoms) return null;

  const risk = getRiskLevel(formData.severity, formData.symptoms);
  const now = new Date().toLocaleString("en-US", { hour: "numeric", minute: "numeric", month: "short", day: "numeric" });
  const shortId = sessionId.substring(0, 6);

  const riskBadgeColor =
    risk.level === "emergency" ? "bg-danger/10 text-danger border-danger/30" :
    risk.level === "high"      ? "bg-warning/10 text-warning border-warning/30" :
    risk.level === "moderate"  ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                 "bg-success/10 text-success border-success/30";

  const radius = 70, circumference = Math.PI * radius;
  const dash = (formData.severity / 10) * circumference;
  const fillClass = risk.level === "emergency" ? "text-danger" : risk.level === "high" || risk.level === "moderate" ? "text-warning" : "text-success";

  if (loading) {
    return (
      <>
        <DemoNavbar title="Your Health Report" step={3} totalSteps={3} />
        <div className="flex min-h-screen bg-bgLight">
          <div className="w-64 bg-white border-r border-bgSoft" />
          <div className="flex-1 p-8 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 mb-4 animate-pulse">
              <Bot className="text-accent" size={32} />
              <h2 className="font-display font-bold text-xl text-primary">MediFlow AI is preparing your report...</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6"><Skeleton lines={4} className="h-40" /><Skeleton lines={6} className="h-64" /></div>
              <div className="space-y-6"><Skeleton lines={3} className="h-48" /><Skeleton lines={2} className="h-32" /></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── TAB CONTENT ───────────────────────────────────────────────────────────

  const TabOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Header card */}
        <Card padding="lg" className="animate-fadeUp">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="text-accent text-xs font-bold uppercase tracking-widest">AI HEALTH REPORT</p>
              <h2 className="font-display text-2xl text-primary font-bold mt-1">Hello, {patientInfo.name}. Here's your assessment.</h2>
              <p className="text-secondary text-sm mt-1">Generated by MediFlow AI · {now} · Session #{shortId}</p>
            </div>
            <Badge variant={risk.level === "high" ? "high" : risk.level === "emergency" ? "emergency" : risk.level === "moderate" ? "moderate" : "normal"} pulse size="md" className="shrink-0 self-start">
              {risk.label}
            </Badge>
          </div>
          <div className="border-t border-bgSoft mt-5 pt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-primary/40 text-xs font-medium"><Clock size={14} /> Analyzed in 2.4s</div>
            <div className="w-1 h-1 bg-bgSoft rounded-full" />
            <div className="flex items-center gap-1.5 text-primary/40 text-xs font-medium"><ShieldCheck size={14} /> Clinically validated protocols</div>
          </div>
        </Card>

        {/* AI Analysis */}
        <Card padding="lg" className="animate-fadeUp">
          <div className="flex items-center gap-2 mb-5"><Bot className="text-accent" size={24} /><h3 className="font-display text-lg text-primary font-bold">AI Clinical Analysis</h3></div>
          <div className="bg-bgLight/50 rounded-2xl rounded-tl-none p-5 text-sm text-primary leading-relaxed font-medium">
            "Based on your reported symptoms of <span className="italic">'{formData.symptoms.substring(0, 80)}{formData.symptoms.length > 80 ? "..." : ""}'</span> with a severity of {formData.severity}/10 and duration of {formData.duration || "unspecified time"}, MediFlow AI has identified this as a <span className="font-bold">{risk.label}</span> situation. {risk.advice}"
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

        {/* Symptom Summary */}
        <Card padding="lg" className="animate-fadeUp">
          <div className="flex items-center gap-2 mb-5"><FileText className="text-secondary" size={20} /><h3 className="font-display text-lg text-primary font-bold">Symptom Summary</h3></div>
          <div className="divide-y divide-bgSoft/50 text-sm">
            {[
              ["Primary Symptoms", formData.symptoms],
              ["Severity Level", `${formData.severity} / 10`],
              ["Duration", formData.duration || "Not specified"],
              ["Additional Info", formData.additionalNotes || "None provided"],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-1 sm:grid-cols-3 py-3 gap-1 sm:gap-4">
                <span className="text-primary/60 font-medium">{label}</span>
                <span className="sm:col-span-2 font-medium italic text-primary/90">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Next Steps */}
        <Card padding="lg" className="animate-fadeUp">
          <div className="flex items-center gap-2 mb-5"><Zap className="text-warning" size={20} /><h3 className="font-display text-lg text-primary font-bold">Next Steps</h3></div>
          <div className="bg-primary rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Recommended Action</p>
            <p className="font-display text-xl sm:text-2xl font-bold">{risk.nextAction}</p>
            <button className="mt-5 bg-white text-primary hover:bg-bgLight transition-colors font-bold rounded-xl px-6 py-3 text-sm inline-flex items-center gap-2 shadow-sm">
              Take Action Now <ArrowRight size={16} />
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {[
              { icon: <Phone size={20} />, label: "Call Emergency: 112", bg: "bg-success/10 text-success" },
              { icon: <Video size={20} />, label: "Start Telemedicine Consult", bg: "bg-accent/10 text-accent" },
              { icon: <Calendar size={20} />, label: "Book Appointment", bg: "bg-secondary/10 text-secondary" },
            ].map(({ icon, label, bg }) => (
              <Card key={label} padding="sm" hover className="flex items-center gap-4 bg-bgLight/30 border-transparent hover:border-bgSoft">
                <div className={`${bg} rounded-lg p-2.5`}>{icon}</div>
                <div className="flex-1 font-semibold text-sm text-primary">{label}</div>
                <ArrowRight size={16} className="text-primary/30" />
              </Card>
            ))}
          </div>
        </Card>
      </div>

      {/* Right column */}
      <div className="space-y-6">
        {/* Gauge */}
        <Card padding="lg" className="animate-fadeUp flex flex-col items-center">
          <h3 className="font-display text-base text-primary font-bold w-full mb-6">Risk Assessment</h3>
          <div className="relative w-40 h-24 overflow-hidden mb-2">
            <svg viewBox="0 0 160 80" className="w-full h-full overflow-visible">
              <path d="M 10 70 A 60 60 0 0 1 150 70" fill="none" stroke="#BEE9E8" strokeWidth="16" strokeLinecap="round" />
              <path d="M 10 70 A 60 60 0 0 1 150 70" fill="none" stroke="currentColor" className={fillClass} strokeWidth="16" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - dash} style={{ transition: "stroke-dashoffset 1s ease-out" }} />
            </svg>
            <div className="absolute bottom-0 left-0 w-full text-center flex flex-col items-center">
              <span className="font-display font-bold text-4xl text-primary leading-none">{formData.severity}<span className="text-lg text-primary/40">/10</span></span>
            </div>
          </div>
          <Badge variant={risk.level === "high" ? "high" : risk.level === "emergency" ? "emergency" : risk.level === "moderate" ? "moderate" : "normal"} size="md" className="mt-4">{risk.label}</Badge>
          <div className="w-full grid grid-cols-3 gap-2 mt-8 border-t border-bgSoft pt-4">
            {[
              { dot: "bg-accent", label: "Severity", val: `${formData.severity}/10` },
              { dot: "bg-secondary", label: "Duration", val: formData.duration ? formData.duration.split(" ")[0] : "N/A" },
              { dot: risk.level === "emergency" ? "bg-danger" : risk.level === "high" ? "bg-warning" : "bg-success", label: "Risk", val: risk.level === "emergency" ? "High" : "Low" },
            ].map(({ dot, label, val }) => (
              <div key={label} className="flex flex-col items-center text-center gap-1">
                <span className={`w-2 h-2 rounded-full ${dot} mb-1`} />
                <span className="text-[10px] text-primary/50 uppercase font-bold tracking-wider">{label}</span>
                <span className="text-xs font-bold text-primary">{val}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Specialist */}
        <Card padding="lg" className="animate-fadeUp">
          <div className="flex items-center gap-2 mb-4"><Stethoscope className="text-secondary" size={20} /><h3 className="font-display text-base text-primary font-bold">Recommended Specialist</h3></div>
          <p className="font-display text-2xl text-primary font-bold mt-1">{risk.specialist}</p>
          <p className="text-xs text-secondary mt-2 leading-relaxed font-medium">{risk.specialistReason}</p>
          <div className="border-t border-bgSoft my-4" />
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary"><Clock size={16} className="text-accent" /> Wait Time</div>
            <Badge variant="low" size="sm" className="bg-bgLight font-bold">{risk.waitTime}</Badge>
          </div>
          <div className="bg-bgLight/60 rounded-xl p-4 flex items-center gap-3 border border-bgSoft/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shrink-0">Dr</div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-primary text-sm">Dr. Priya Sharma</p>
              <p className="text-secondary text-[10px] uppercase font-bold tracking-wider">{risk.specialist}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-warning text-xs">★★★★★</div>
              <div className="text-primary/60 text-[10px] font-bold">4.9 (120)</div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card padding="lg" className="animate-fadeUp">
          <h3 className="font-display text-base text-primary font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full py-3 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-secondary transition-colors shadow-sm active:scale-[0.98]">Book Appointment</button>
            <button onClick={() => { reset(); router.push("/demo"); }} className="w-full py-3 bg-bgSoft text-primary font-semibold rounded-xl text-sm border border-bgLight hover:bg-bgLight transition-colors active:scale-[0.98]">Start New Assessment</button>
            <button className="w-full py-3 bg-transparent text-primary font-semibold rounded-xl text-sm border-2 border-primary hover:bg-primary hover:text-white transition-colors active:scale-[0.98]">Share Report</button>
          </div>
          <div className="mt-6 pt-4 border-t border-bgSoft text-center">
            <p className="text-[10px] text-primary/40 font-medium leading-relaxed uppercase tracking-wider">This is a demo report.<br />Always consult a qualified physician.</p>
          </div>
        </Card>
      </div>
    </div>
  );

  const TabHealthSummary = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card padding="lg" className="animate-fadeUp">
        <div className="flex items-center gap-2 mb-4"><User className="text-secondary" size={20} /><h3 className="font-display text-lg text-primary font-bold">Patient Profile</h3></div>
        <div className="divide-y divide-bgSoft/50 text-sm">
          {[
            ["Full Name", patientInfo.name],
            ["Age", healthHistory.age || "Not provided"],
            ["Gender", healthHistory.gender || "Not provided"],
            ["Email", patientInfo.email || "Not provided"],
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-2 py-3 gap-2">
              <span className="text-primary/50 font-medium">{label}</span>
              <span className="font-semibold text-primary">{value}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card padding="lg" className="animate-fadeUp">
        <div className="flex items-center gap-2 mb-4"><HeartPulse className="text-danger" size={20} /><h3 className="font-display text-lg text-primary font-bold">Medical History</h3></div>
        <div className="space-y-3 text-sm">
          {[
            ["Conditions", healthHistory.conditions || "None reported"],
            ["Past Surgeries", healthHistory.surgeries || "None reported"],
            ["Allergies", healthHistory.allergies || "None reported"],
            ["Medications", healthHistory.medications || "None reported"],
          ].map(([label, value]) => (
            <div key={label} className="bg-bgLight/50 rounded-xl p-3 border border-bgSoft/40">
              <span className="text-xs font-bold text-primary/40 uppercase tracking-wider">{label}</span>
              <p className="font-medium text-primary mt-1">{value}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card padding="lg" className="animate-fadeUp lg:col-span-2">
        <div className="flex items-center gap-2 mb-4"><Activity className="text-accent" size={20} /><h3 className="font-display text-lg text-primary font-bold">Current Symptoms</h3></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Severity" value={`${formData.severity}/10`} dotColor={risk.level === "emergency" ? "bg-danger" : risk.level !== "normal" ? "bg-warning" : "bg-success"} />
          <StatCard label="Duration" value={formData.duration || "N/A"} sub="Self reported" dotColor="bg-secondary" />
          <StatCard label="Risk Level" value={risk.label} sub="AI assessed" dotColor={risk.level === "emergency" ? "bg-danger" : risk.level !== "normal" ? "bg-warning" : "bg-success"} />
          <StatCard label="Confidence" value="87%" sub="Model score" dotColor="bg-accent" />
        </div>
      </Card>
    </div>
  );

  const TabAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card padding="lg" className="animate-fadeUp">
          <div className="flex items-center gap-2 mb-1"><BarChart2 className="text-secondary" size={18} /><h3 className="font-display text-base text-primary font-bold">Symptom Severity</h3></div>
          <p className="text-xs text-secondary mb-4">Your severity relative to scale</p>
          <SeverityBarChart severity={formData.severity} />
        </Card>
        <Card padding="lg" className="animate-fadeUp">
          <div className="flex items-center gap-2 mb-1"><HeartPulse className="text-danger" size={18} /><h3 className="font-display text-base text-primary font-bold">Health Distribution</h3></div>
          <p className="text-xs text-secondary mb-4">Breakdown of contributing factors</p>
          <HealthPieChart
            severity={formData.severity}
            hasConditions={!!healthHistory.conditions && healthHistory.conditions !== "None"}
            hasAllergies={!!healthHistory.allergies}
          />
        </Card>
        <Card padding="lg" className="animate-fadeUp">
          <div className="flex items-center gap-2 mb-1"><Zap className="text-warning" size={18} /><h3 className="font-display text-base text-primary font-bold">Trend Analysis</h3></div>
          <p className="text-xs text-secondary mb-4">Projected severity trend (mock)</p>
          <TrendLineChart severity={formData.severity} />
        </Card>
        <Card padding="lg" className="animate-fadeUp">
          <div className="flex items-center gap-2 mb-1"><Calendar className="text-accent" size={18} /><h3 className="font-display text-base text-primary font-bold">Consults & Effectiveness</h3></div>
          <p className="text-xs text-secondary mb-4">Visit frequency vs. treatment outcome</p>
          <ConsultEffectivenessChart severity={formData.severity} />
        </Card>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Severity Score" value={`${formData.severity}/10`} dotColor={risk.level !== "normal" ? "bg-warning" : "bg-success"} />
        <StatCard label="Risk Category" value={risk.label} dotColor={risk.level === "emergency" ? "bg-danger" : risk.level !== "normal" ? "bg-warning" : "bg-success"} />
        <StatCard label="Conditions" value={healthHistory.conditions ? healthHistory.conditions.split(",").length.toString() : "0"} sub="Reported" dotColor="bg-secondary" />
        <StatCard label="AI Score" value="87%" sub="Confidence" dotColor="bg-accent" />
      </div>
    </div>
  );

  const TabRecommendations = () => {
    const recs = [
      { icon: <CheckCircle size={18} className="text-success" />, title: "Rest & Hydration", desc: "Get at least 8 hours of sleep. Drink 2–3L of water daily to support recovery.", urgency: "Immediate" },
      { icon: <AlertTriangle size={18} className="text-warning" />, title: "Monitor Symptoms", desc: "Track your severity daily. If symptoms worsen beyond current levels, seek care immediately.", urgency: "Ongoing" },
      { icon: <Stethoscope size={18} className="text-secondary" />, title: `Consult ${risk.specialist}`, desc: risk.specialistReason, urgency: risk.waitTime },
      { icon: <HeartPulse size={18} className="text-danger" />, title: "Avoid Triggers", desc: healthHistory.allergies ? `Known allergies: ${healthHistory.allergies}. Avoid exposure.` : "Avoid strenuous activity and stress while symptomatic.", urgency: "Important" },
      { icon: <Lightbulb size={18} className="text-accent" />, title: "Medication Review", desc: healthHistory.medications ? `Current meds: ${healthHistory.medications}. Consult your doctor before changing dosages.` : "No medications reported. Follow doctor's prescription.", urgency: "Advisory" },
      { icon: <Calendar size={18} className="text-primary" />, title: "Follow-Up Appointment", desc: `Schedule a follow-up in ${risk.waitTime} to reassess your condition.`, urgency: risk.waitTime },
    ];
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recs.map(({ icon, title, desc, urgency }) => (
            <Card key={title} padding="lg" className="animate-fadeUp hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="bg-bgLight rounded-lg p-2.5 shrink-0">{icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display font-bold text-primary text-sm">{title}</h4>
                    <span className="text-[10px] bg-bgSoft text-primary/60 px-2 py-0.5 rounded-full font-bold shrink-0">{urgency}</span>
                  </div>
                  <p className="text-xs text-secondary mt-1.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <DemoNavbar title="Your Health Report" step={3} totalSteps={3} />
      <div className="flex min-h-screen bg-bgLight">
        {/* Sidebar */}
        <PatientSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          patientName={patientInfo.name}
          riskLabel={risk.label}
          riskColor={riskBadgeColor}
        />

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Page heading */}
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-primary">
              {activeTab === "overview" && "Overview"}
              {activeTab === "health-summary" && "Health Summary"}
              {activeTab === "analytics" && "Analytics"}
              {activeTab === "recommendations" && "Recommendations"}
            </h1>
            <p className="text-secondary text-sm mt-1">Session #{shortId} · {now}</p>
          </div>

          {activeTab === "overview" && <TabOverview />}
          {activeTab === "health-summary" && <TabHealthSummary />}
          {activeTab === "analytics" && <TabAnalytics />}
          {activeTab === "recommendations" && <TabRecommendations />}
        </main>
      </div>
    </>
  );
}
