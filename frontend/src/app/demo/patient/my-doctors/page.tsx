"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin, Search, CalendarPlus, Pill, TestTube2, AlertCircle } from "lucide-react";
import { DemoNavbar } from "../../../../components/layout/DemoNavbar";
import { PatientSidebar } from "../../../../components/patient/PatientSidebar";
import { appointmentsApi, type Appointment } from "../../../../lib/api";

export default function MyDoctorsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Patient");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pastDoctors, setPastDoctors] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [rebooking, setRebooking] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("mediflow_token") : null;
    if (!token) { router.replace("/demo/patient/auth"); return; }

    try {
      const u = JSON.parse(localStorage.getItem("mediflow_user") || "{}");
      if (u?.name) setUserName(u.name);
      if (u?.id) setUserId(u.id);
    } catch { /* ignore */ }

    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      let patientId = null;
      try {
        const u = JSON.parse(localStorage.getItem("mediflow_user") || "{}");
        if (u?.id) patientId = u.id;
      } catch { /* ignore */ }

      if (!patientId) return;

      const res = await appointmentsApi.getAll({ patientId });
      const list = (res as any).data || (res as any).appointments || [];
      setAllAppointments(list);

      // Filter completed appointments
      const completed = list.filter((a: any) => ["completed", "Completed"].includes(a.status));
      
      // Group by doctor (keep the most recent one for prescription details)
      completed.sort((a: any, b: any) => new Date(b.dateTime || b.date).getTime() - new Date(a.dateTime || a.date).getTime());
      
      const uniqueDocsMap = new Map();
      completed.forEach((apt: any) => {
        const docObj = typeof apt.doctor === 'object' && apt.doctor !== null ? apt.doctor : null;
        const docId = docObj?._id || apt.doctor || apt.doctorId;
        
        if (docId && !uniqueDocsMap.has(docId)) {
          uniqueDocsMap.set(docId, {
            ...docObj,
            _id: docId,
            doctorName: apt.doctorName || docObj?.name,
            specialization: apt.specialization || docObj?.specialization,
            prescription: apt.prescription || "",
            recommendedTests: apt.recommendedTests || "",
            lastVisit: apt.dateTime || apt.date,
            appointmentId: apt._id
          });
        }
      });
      
      setPastDoctors(Array.from(uniqueDocsMap.values()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRebook = async (doc: any) => {
    setRebooking(doc._id);
    try {
      // Duplicate Check
      const isDuplicate = allAppointments.some((a: any) => {
        const docObj = typeof a.doctor === 'object' && a.doctor !== null ? a.doctor : null;
        const aDocId = docObj?._id || a.doctor || a.doctorId;
        const isSameDoc = aDocId === doc._id;
        const st = (a.status || "").toLowerCase();
        return isSameDoc && ["upcoming", "confirmed", "scheduled", "in progress"].includes(st);
      });

      if (isDuplicate) {
        alert(`You already have an upcoming appointment booked with ${doc.doctorName}!`);
        setRebooking(null);
        return;
      }

      // Proceed with booking
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      await appointmentsApi.create({
        doctor: doc._id,
        patient: userId,
        patientName: userName,
        doctorName: doc.doctorName,
        specialization: doc.specialization,
        date: tomorrow,
        dateTime: tomorrow.toISOString(),
        timeSlot: "10:00",
        status: "upcoming",
        reason: "Re-booking / Follow-up",
        priority: "success",
      });

      alert(`Appointment successfully re-booked with ${doc.doctorName}! Check your Appointments page.`);
      
      await loadData();
      window.dispatchEvent(new Event("appointmentUpdated"));
    } catch (err) {
      alert("Failed to re-book appointment. Please try again.");
    } finally {
      setRebooking(null);
    }
  };

  return (
    <>
      <DemoNavbar title="My Care Team" />
      <div className="flex min-h-screen bg-bgLight">
        <PatientSidebar
          activeTab="my-doctors"
          onTabChange={() => {}}
          patientName={userName}
          riskLabel="Active"
          riskColor="bg-success/10 text-success border-success/30"
        />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-primary">My Care Team</h1>
            <p className="text-secondary text-sm mt-1">
              Doctors you have previously visited, along with their latest prescriptions and recommended tests.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-48 border border-[#E2E8F0]"></div>
              ))}
            </div>
          ) : pastDoctors.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {pastDoctors.map((doc, idx) => {
                const docRating = doc.rating || "4.5";
                const docExp = doc.experience ? `${doc.experience} years` : "10+ years";
                const docFee = doc.consultationFee ? `₹${doc.consultationFee}` : "₹500";

                return (
                  <div key={doc._id || idx} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row">
                    
                    {/* Doctor Info Section */}
                    <div className="p-6 border-b md:border-b-0 md:border-r border-[#E2E8F0] md:w-1/3 flex flex-col bg-[#F8FAFC]">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-[#1B4965] flex items-center justify-center shrink-0 shadow-sm border-2 border-white">
                          <User size={28} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#1B4965] text-lg leading-tight">{doc.doctorName}</h3>
                          <p className="text-[13px] font-bold text-[#0A7029] bg-[#E7FCE3] inline-block px-2 py-0.5 rounded-md mt-1.5">{doc.specialization}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-3 mt-auto">
                        <span className="flex items-center gap-1.5 text-[13px] text-[#64748B] font-medium">
                          <span className="text-[14px]">⭐</span> {docRating}
                        </span>
                        <span className="flex items-center gap-1.5 text-[13px] text-[#64748B] font-medium">
                          <span className="text-[#1B4965] font-bold text-[14px]">₹</span> {docFee}
                        </span>
                        <span className="flex items-center gap-1.5 text-[13px] text-[#64748B] font-medium">
                          <span className="text-[14px]">🩺</span> {docExp}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleRebook(doc)}
                        disabled={rebooking === doc._id}
                        className="mt-6 w-full py-2.5 rounded-xl bg-[#1B4965] text-white text-[14px] font-bold hover:bg-[#143A52] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CalendarPlus size={16} />
                        {rebooking === doc._id ? "Booking..." : "Re-book Appointment"}
                      </button>
                    </div>

                    {/* Medical Details Section */}
                    <div className="p-6 flex-1 flex flex-col gap-6">
                      {/* Prescription */}
                      <div>
                        <h4 className="flex items-center gap-2 text-[14px] font-bold text-[#1B4965] uppercase tracking-wide mb-3">
                          <Pill size={16} className="text-[#0284C7]" /> Latest Prescription
                        </h4>
                        <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-4 text-[14px] text-[#0369A1] leading-relaxed whitespace-pre-wrap min-h-[80px]">
                          {doc.prescription ? doc.prescription : (
                            <span className="flex items-center gap-2 text-[#7DD3FC] italic">
                              <AlertCircle size={14} /> No prescription recorded for last visit.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Recommended Tests */}
                      <div>
                        <h4 className="flex items-center gap-2 text-[14px] font-bold text-[#1B4965] uppercase tracking-wide mb-3">
                          <TestTube2 size={16} className="text-[#8B5CF6]" /> Recommended Tests
                        </h4>
                        <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl p-4 text-[14px] text-[#6D28D9] leading-relaxed whitespace-pre-wrap min-h-[80px]">
                          {doc.recommendedTests ? doc.recommendedTests : (
                            <span className="flex items-center gap-2 text-[#C4B5FD] italic">
                              <AlertCircle size={14} /> No tests recommended.
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-[#E2E8F0] flex justify-between items-center">
                        <span className="text-[12px] text-[#94A3B8] font-medium">
                          Last Visit: {doc.lastVisit ? new Date(doc.lastVisit).toLocaleDateString([], { dateStyle: 'medium' }) : "Unknown"}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E2E8F0]">
              <div className="w-16 h-16 bg-bgLight rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-primary/30" />
              </div>
              <h3 className="text-primary font-bold mb-1">No doctors found</h3>
              <p className="text-sm text-primary/60 mb-6 max-w-md mx-auto">
                You haven't completed any appointments yet. Once you complete a visit, your doctor and their prescriptions will appear here.
              </p>
              <button
                onClick={() => router.push("/demo/patient/appointments")}
                className="bg-primary text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-secondary transition-colors"
              >
                Go to Appointments
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
