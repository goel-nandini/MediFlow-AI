"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, History, Activity, FileIcon, Eye } from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import { Badge } from "../../../../components/ui/Badge";
import { DemoNavbar } from "../../../../components/layout/DemoNavbar";
import { PatientSidebar, type PatientTab } from "../../../../components/patient/PatientSidebar";

interface HealthRecord {
  id: number;
  date: string;
  symptoms: string;
  severity: string;
  riskLevel: string;
  aiSummary: string;
  suggestions?: string[];
  type?: "assessment" | "report";
  fileName?: string;
  reportType?: string;
  fileBase64?: string;
}

const REPORT_TYPES = ["Blood Test", "X-Ray", "MRI", "ECG", "Prescription", "Other"];

export default function PatientHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [timeline, setTimeline] = useState<HealthRecord[]>([]);

  // Upload states
  const [file, setFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState("Blood Test");
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("mediflow_user");
      if (!storedUser) { router.replace("/demo/patient/auth"); return; }
      setUser(JSON.parse(storedUser));
      loadTimeline();
    } catch (e) { }

    const handleUpdate = () => loadTimeline();
    window.addEventListener("healthHistoryUpdated", handleUpdate);
    window.addEventListener("healthUpdated", handleUpdate);
    return () => {
      window.removeEventListener("healthHistoryUpdated", handleUpdate);
      window.removeEventListener("healthUpdated", handleUpdate);
    };
  }, [router]);

  const loadTimeline = () => {
    try {
      const history = JSON.parse(localStorage.getItem("mediflow_health_history") || "[]");
      const reports = JSON.parse(localStorage.getItem("mediflow_reports") || "[]");

      const combined = [
        ...history.map((h: any) => ({ ...h, type: "assessment" })),
        ...reports.map((r: any) => ({ ...r, type: "report" }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTimeline(combined);
    } catch { }
  };

  const handleUpload = () => {
    if (!file) return;
    setIsUploading(true);
    setUploadSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const newReport = {
        id: Date.now(),
        date: new Date(reportDate).toISOString(),
        type: "report",
        fileName: file.name,
        reportType,
        fileBase64: base64,
        symptoms: `Uploaded: ${reportType}`,
        severity: "—",
        riskLevel: "Analyzed",
        aiSummary: "Analyzing report...",
      };

      // Initial save
      const reports = JSON.parse(localStorage.getItem("mediflow_reports") || "[]");
      reports.unshift(newReport);
      localStorage.setItem("mediflow_reports", JSON.stringify(reports));
      window.dispatchEvent(new Event("healthUpdated"));

      // Mock backend delay for analysis
      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(true);

        // Update with analysis
        const currentReports = JSON.parse(localStorage.getItem("mediflow_reports") || "[]");
        const updated = currentReports.map((r: any) => r.id === newReport.id ? {
          ...r,
          aiSummary: "Report appears normal. No critical findings detected. Consult your doctor for detailed review."
        } : r);

        localStorage.setItem("mediflow_reports", JSON.stringify(updated));
        window.dispatchEvent(new Event("healthUpdated"));
        setFile(null);
        setTimeout(() => setUploadSuccess(false), 3000);
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  if (!user) return null;

  return (
    <>
      <DemoNavbar title="Health History" />
      <div className="flex min-h-screen bg-bgLight">
        <PatientSidebar activeTab="health-history" onTabChange={() => { }} patientName={user.name} riskLabel="Active" riskColor="bg-success/10 text-success border-success/30" />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-primary">Health History & Reports</h1>
            <p className="text-secondary text-sm mt-1">Track your symptoms over time and manage your medical records securely.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* ─── SECTION 1: UPLOAD ─── */}
            {/* <div className="xl:col-span-1">
              <Card padding="lg" className="animate-fadeUp sticky top-6">
                <div className="flex items-center gap-2 mb-5">
                  <Upload size={20} className="text-accent" />
                  <h2 className="font-display text-lg text-primary font-bold">Upload Report</h2>
                </div>
                
                <div className="space-y-4"> */}
            {/* File Drop/Input */}
            {/* <div className="border-2 border-dashed border-bgSoft rounded-xl p-6 text-center bg-bgLight/30 hover:bg-bgLight/50 transition-colors relative cursor-pointer group">
                    <input type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <FileText size={24} className="text-secondary mx-auto mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <p className="text-sm font-bold text-primary mb-1">Click to upload or drag & drop</p>
                    <p className="text-[11px] text-primary/50">PDF, PNG, JPG (max 5MB)</p>
                  </div>
                  
                  {file && (
                    <div className="bg-accent/10 border border-accent/20 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileIcon size={16} className="text-accent shrink-0"/>
                        <span className="text-xs font-semibold text-primary truncate">{file.name}</span>
                      </div>
                      <button onClick={() => setFile(null)} className="text-xs text-danger font-bold hover:underline shrink-0 ml-2">Remove</button>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-primary/50 block mb-1">Report Type</label>
                      <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full border border-bgSoft rounded-lg p-2.5 text-sm outline-none focus:border-secondary bg-white">
                        {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-primary/50 block mb-1">Report Date</label>
                      <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="w-full border border-bgSoft rounded-lg p-2.5 text-sm outline-none focus:border-secondary bg-white" />
                    </div>
                  </div>

                  <button 
                    onClick={handleUpload} 
                    disabled={!file || isUploading}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${(!file || isUploading) ? "bg-bgSoft text-primary/40 cursor-not-allowed" : "bg-primary text-white hover:bg-secondary"}`}
                  >
                    {isUploading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Uploading...</span> : "Upload & Analyze"}
                  </button>
                  
                  {uploadSuccess && (
                    <p className="text-xs font-semibold text-success text-center bg-success/10 p-2 rounded-lg">✅ Report uploaded & analyzed!</p>
                  )}
                </div>
              </Card>
            </div> */}

            {/* ─── SECTION 2: TIMELINE ─── */}
            <div className="xl:col-span-2">
              <Card padding="lg" className="animate-fadeUp min-h-[500px]">
                <div className="flex items-center gap-2 mb-6 border-b border-bgSoft pb-4">
                  <History size={20} className="text-warning" />
                  <h2 className="font-display text-lg text-primary font-bold">History Timeline</h2>
                </div>

                {timeline.length > 0 ? (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-bgSoft">
                    {timeline.map((rec, i) => (
                      <div key={i} className="relative flex items-start gap-4">
                        <div className={`flex items-center justify-center w-4 h-4 rounded-full border-2 border-white shrink-0 mt-1 z-10 ${rec.type === "report" ? "bg-accent" : "bg-warning"}`} />
                        <div className="flex-1 bg-white p-5 rounded-2xl border border-bgSoft shadow-sm hover:shadow-md transition-shadow">

                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-primary/50 uppercase tracking-wider bg-bgLight px-2 py-1 rounded-md">
                                {new Date(rec.date || rec.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                              </span>
                              {rec.type === "report" && <Badge variant="normal" size="sm">{rec.reportType}</Badge>}
                            </div>
                            <Badge variant={rec.riskLevel?.toLowerCase().includes("high") ? "emergency" : rec.riskLevel?.toLowerCase().includes("moderate") ? "warning" : "success"} size="sm">
                              {rec.riskLevel || "Analyzed"}
                            </Badge>
                          </div>

                          <h3 className="font-bold text-primary text-base mb-1.5">{rec.type === "report" ? `Uploaded Report: ${rec.fileName}` : "AI Assessment"}</h3>
                          {rec.type === "assessment" && <p className="text-sm font-medium text-secondary mb-3">Symptoms: {rec.symptoms}</p>}
                          {rec.type === "assessment" && (rec as any).specialist && (
                            <p className="text-xs font-semibold text-primary/60 mb-1">
                              🩺 Specialist Recommended: <span className="text-primary">{(rec as any).specialist}</span>
                            </p>
                          )}
                          {rec.type === "assessment" && (
                            <p className="text-xs font-semibold mb-3">
                              {(rec as any).appointmentBooked
                                ? <span className="text-success">✅ Appointment Booked</span>
                                : <span className="text-primary/40">⬜ No appointment booked</span>}
                            </p>
                          )}

                          <div className="bg-bgLight/40 p-4 rounded-xl border border-bgSoft">
                            <h4 className="text-xs font-bold text-primary/70 uppercase tracking-wider mb-1">AI Summary</h4>
                            <p className="text-sm text-primary leading-relaxed">{rec.aiSummary}</p>

                            {rec.suggestions && rec.suggestions.length > 0 && (
                              <ul className="text-[13px] text-primary/80 space-y-1 mt-3 list-disc pl-4 marker:text-accent">
                                {rec.suggestions.map((sug, idx) => <li key={idx}>{sug}</li>)}
                              </ul>
                            )}
                          </div>

                          {(rec as any).assignedDoctor && (
                            <div className="mt-4 border-t border-[#E2E8F0] pt-4">
                              <p className="text-[#1B4965] font-bold text-[13px] mb-2">👨‍⚕️ Assigned Doctor</p>
                              <div className="bg-[#F0F7FC] rounded-xl p-3 flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-[#1B4965] text-[14px]">
                                    {(rec as any).assignedDoctor.name}
                                  </p>
                                  <p className="text-[#64748B] text-[12px]">
                                    {(rec as any).assignedDoctor.specialization} · ⭐ {(rec as any).assignedDoctor.rating}
                                  </p>
                                  <p className="text-[#64748B] text-[12px] mt-1">
                                    📅 Appointment: {(rec as any).appointmentDate
                                      ? new Date((rec as any).appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                      : "Scheduled"}
                                  </p>
                                  <p className="text-[#64748B] text-[12px]">
                                    🔗 Source: {(rec as any).appointmentSource === "chatbot" ? "Booked via AI Assistant" : "Manually Booked"}
                                  </p>
                                </div>
                                <span className="text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-full font-semibold">
                                  Confirmed
                                </span>
                              </div>
                            </div>
                          )}

                          {!(rec as any).assignedDoctor && rec.type === "assessment" && (
                            <div className="mt-4 border-t border-[#E2E8F0] pt-4">
                              <p className="text-[#94A3B8] text-[13px]">
                                No doctor assigned yet
                              </p>
                            </div>
                          )}

                          {rec.type === "report" && rec.fileBase64 && (
                            <div className="mt-4 flex justify-end">
                              <button onClick={() => {
                                const w = window.open();
                                if (w) w.document.write(`<iframe src="${rec.fileBase64}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                              }} className="flex items-center gap-1.5 text-xs font-bold text-accent hover:text-primary transition-colors">
                                <Eye size={14} /> View Full Report
                              </button>
                            </div>
                          )}

                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-bgLight rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity size={24} className="text-primary/30" />
                    </div>
                    <h3 className="text-primary font-bold mb-1">No health history yet</h3>
                    <p className="text-sm text-primary/60">Complete an AI assessment or upload a report to build your timeline.</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
