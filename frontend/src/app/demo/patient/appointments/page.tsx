"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, User, Clock, MapPin, Search } from "lucide-react";
import { PageContainer } from "../../../../components/ui/PageContainer";
import { Card } from "../../../../components/ui/Card";
import { Badge } from "../../../../components/ui/Badge";
import { DemoNavbar } from "../../../../components/layout/DemoNavbar";
import { PatientSidebar } from "../../../../components/patient/PatientSidebar";
import { appointmentsApi, type Appointment } from "../../../../lib/api";

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tab, setTab]     = useState<"upcoming" | "previous">("upcoming");
  const [userName, setUserName] = useState("Patient");
  const [loading, setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState<any[]>([]);

  useEffect(() => {
    // Guard: must be logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("mediflow_token") : null;
    if (!token) { router.replace("/demo/patient/auth"); return; }

    // Get display name from cache
    try {
      const u = JSON.parse(localStorage.getItem("mediflow_user") || "{}");
      if (u?.name) setUserName(u.name);
    } catch { /* ignore */ }

    loadAppointments();

    // Refetch whenever any page dispatches the "appointmentUpdated" event
    window.addEventListener("appointmentUpdated", loadAppointments);
    return () => {
      window.removeEventListener("appointmentUpdated", loadAppointments);
    };
  }, [router]);

  useEffect(() => {
    const loadRecommended = () => {
      try {
        const stored = localStorage.getItem("mediflow_recommended_doctors");
        if (stored) {
          setRecommendedDoctors(JSON.parse(stored));
        } else {
          setRecommendedDoctors([]);
        }
      } catch {
        setRecommendedDoctors([]);
      }
    };

    loadRecommended();
    window.addEventListener("recommendedDoctorsUpdated", loadRecommended);
    return () => {
      window.removeEventListener("recommendedDoctorsUpdated", loadRecommended);
    };
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentsApi.getAll();
      setAppointments(res.appointments || []);
    } catch {
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem("mediflow_appointments");
        if (stored) setAppointments(JSON.parse(stored));
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      await appointmentsApi.update(id, { status: "cancelled" });
      setAppointments(prev =>
        prev.map(a => a._id === id ? { ...a, status: "cancelled" } : a)
      );
      window.dispatchEvent(new Event("appointmentUpdated"));
    } catch {
      // Optimistic update even if backend fails
      setAppointments(prev =>
        prev.map(a => a._id === id ? { ...a, status: "cancelled" } : a)
      );
    } finally {
      setCancelling(null);
    }
  };

  const upcoming = appointments.filter(a =>
    ["upcoming", "confirmed", "Scheduled", "Confirmed", "In Progress"].includes(a.status)
  );
  const previous = appointments.filter(a =>
    ["completed", "cancelled", "Completed", "Cancelled", "No Show"].includes(a.status)
  );
  const displayed = tab === "upcoming" ? upcoming : previous;

  const formatDateTime = (dt?: string) => {
    if (!dt) return "Date TBD";
    const d = new Date(dt);
    if (isNaN(d.getTime())) return dt; // raw string fallback
    return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  };

  const [bookingDocId, setBookingDocId] = useState<string | null>(null);

  const bookRecommended = async (doc: any) => {
    setBookingDocId(doc._id);
    try {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await appointmentsApi.create({
        doctor: doc._id,
        patientName: userName,
        doctorName: doc.name,
        specialization: doc.specialization,
        date: tomorrow,
        dateTime: tomorrow.toISOString(),
        timeSlot: "10:00",
        status: "upcoming",
        reason: "AI Recommended Booking",
        priority: "success",
      });
      // Refresh appointments list
      await loadAppointments();
      // Remove this doctor from recommendations
      const updated = recommendedDoctors.filter((d: any) => d._id !== doc._id);
      setRecommendedDoctors(updated);
      localStorage.setItem("mediflow_recommended_doctors", JSON.stringify(updated));
      window.dispatchEvent(new Event("appointmentUpdated"));
    } catch {
      // silent fail
    } finally {
      setBookingDocId(null);
    }
  };

  return (
    <>
      <DemoNavbar title="Appointments" />
      <div className="flex min-h-screen bg-bgLight">
        <PatientSidebar
          activeTab="appointments"
          onTabChange={() => {}}
          patientName={userName}
          riskLabel="Active"
          riskColor="bg-success/10 text-success border-success/30"
        />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-primary">Your Appointments</h1>
            <p className="text-secondary text-sm mt-1">
              Manage your upcoming visits and view past consultations.
            </p>
          </div>

          {recommendedDoctors.length > 0 ? (
            <div className="mb-8">
              <h2 className="text-[#1B4965] text-lg font-bold mb-4">
                🩺 Recommended Doctors
              </h2>
              <p className="text-[#64748B] text-sm mb-4">
                Based on your recent AI assessment
              </p>
              <div className="grid grid-cols-1 gap-4">
                {recommendedDoctors.map((doc: any, i: number) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-[#E2E8F0] flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#1B4965] text-[15px]">
                        {doc.name}
                      </p>
                      <p className="text-[#64748B] text-[13px]">
                        {doc.specialization}
                      </p>
                      <p className="text-[#64748B] text-[13px]">
                        ⭐ {doc.rating} ·{doc.isAvailable ? " Available" : " Unavailable"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] bg-[#CAE9FF] text-[#1B4965] px-3 py-1 rounded-full font-semibold">
                        AI Pick #{i + 1}
                      </span>
                      <button
                        onClick={() => bookRecommended(doc)}
                        disabled={bookingDocId === doc._id}
                        className="text-[13px] bg-[#1B4965] text-white px-4 py-1.5 rounded-full font-bold hover:bg-[#143A52] transition-colors disabled:opacity-50"
                      >
                        {bookingDocId === doc._id ? "Booking..." : "Book Appointment"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0] text-center">
              <p className="text-[#64748B] text-[14px] mb-4">
                No recommendations yet
              </p>
              <button
                onClick={() => router.push("/demo/patient/ai-assistant")}
                className="bg-[#1B4965] text-white px-5 py-2 rounded-xl text-[14px] font-bold"
              >
                Talk to AI Assistant
              </button>
            </div>
          )}

          <Card padding="none" className="overflow-hidden animate-fadeUp">
            {/* Tabs */}
            <div className="flex border-b border-bgSoft">
              {(["upcoming", "previous"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${
                    tab === t
                      ? "border-primary text-primary bg-bgLight/30"
                      : "border-transparent text-primary/50 hover:text-primary hover:bg-bgLight/20"
                  }`}
                >
                  {t === "upcoming" ? `Upcoming (${upcoming.length})` : `Previous (${previous.length})`}
                </button>
              ))}
            </div>

            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-bgLight rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : displayed.length > 0 ? (
                <div className="space-y-4">
                  {displayed.map((apt) => (
                    <div
                      key={apt._id}
                      className="bg-white border border-bgSoft p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-xl bg-bgLight border border-bgSoft flex items-center justify-center shrink-0">
                          <User size={24} className="text-secondary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-primary text-base">{apt.doctorName || "Doctor"}</h3>
                          <p className="text-sm font-semibold text-secondary mt-0.5">{apt.specialization || "Consultation"}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-primary/60 mt-3 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock size={14} /> {formatDateTime(apt.dateTime)}
                            </span>
                            {apt.clinicName && (
                              <span className="flex items-center gap-1">
                                <MapPin size={14} /> {apt.clinicName}
                              </span>
                            )}
                            {apt.fee && (
                              <span className="flex items-center gap-1 font-semibold">
                                Fee: {apt.fee}
                              </span>
                            )}
                          </div>
                          {apt.reason && (
                            <p className="text-xs text-primary/50 mt-2 italic">
                              Reason: {apt.reason}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <Badge
                          variant={
                            apt.status === "cancelled" ? "danger"
                            : apt.status === "completed" ? "normal"
                            : "success"
                          }
                          size="md"
                        >
                          {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                        </Badge>
                        {tab === "upcoming" && apt.status !== "cancelled" && (
                          <button
                            onClick={() => handleCancel(apt._id)}
                            disabled={cancelling === apt._id}
                            className="text-xs font-bold text-danger hover:underline disabled:opacity-50"
                          >
                            {cancelling === apt._id ? "Cancelling…" : "Cancel Appointment"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-bgLight rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-primary/30" />
                  </div>
                  <h3 className="text-primary font-bold mb-1">No {tab} appointments</h3>
                  <p className="text-sm text-primary/60 mb-6">
                    You don&apos;t have any {tab} consultations yet.
                  </p>
                  {tab === "upcoming" && (
                    <button
                      onClick={() => router.push("/demo/patient/chat")}
                      className="bg-primary text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-secondary transition-colors"
                    >
                      Book via AI Assistant
                    </button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </main>
      </div>
    </>
  );
}
