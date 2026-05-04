"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, User, Clock, MapPin, Search } from "lucide-react";
import { PageContainer } from "../../../../components/ui/PageContainer";
import { Card } from "../../../../components/ui/Card";
import { Badge } from "../../../../components/ui/Badge";
import { DemoNavbar } from "../../../../components/layout/DemoNavbar";
import { PatientSidebar } from "../../../../components/patient/PatientSidebar";
import { appointmentsApi, doctorsApi, type Appointment } from "../../../../lib/api";

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tab, setTab] = useState<"upcoming" | "previous">("upcoming");
  const [userName, setUserName] = useState("Patient");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState<any[]>([]);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [bookingDocId, setBookingDocId] = useState<string | null>(null);

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
      let patientId = null;
      try {
        const u = JSON.parse(localStorage.getItem("mediflow_user") || "{}");
        if (u?.id) patientId = u.id;
      } catch { /* ignore */ }

      const params = patientId ? { patientId } : undefined;
      const res = await appointmentsApi.getAll(params);
      const list = (res as any).data || (res as any).appointments || [];
      setAppointments(list);
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await doctorsApi.getAll({ search: searchQuery });
      setSearchResults((res as any).data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const bookDoctor = async (doc: any, reason: string) => {
    setBookingDocId(doc._id);
    try {
      let patientId = null;
      try {
        const u = JSON.parse(localStorage.getItem("mediflow_user") || "{}");
        if (u?.id) patientId = u.id;
      } catch { /* ignore */ }

      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const isDuplicate = appointments.some((a: any) => {
        const isSameDoc = a.doctorName === doc.name || a.doctorId === doc._id || a.doctor === doc._id || (a.doctor && a.doctor._id === doc._id);
        const st = (a.status || "").toLowerCase();
        return isSameDoc && ["upcoming", "confirmed", "scheduled", "in progress"].includes(st);
      });

      if (isDuplicate) {
        alert(`You already have an upcoming appointment with ${doc.name}!`);
        setBookingDocId(null);
        return;
      }

      await appointmentsApi.create({
        doctor: doc._id,
        patient: patientId,
        patientName: userName,
        doctorName: doc.name,
        specialization: doc.specialization,
        date: tomorrow,
        dateTime: tomorrow.toISOString(),
        timeSlot: "10:00",
        status: "upcoming",
        reason: reason,
        priority: "success",
      });
      // Refresh appointments list
      await loadAppointments();

      if (reason === "AI Recommended Booking") {
        const updated = recommendedDoctors.filter((d: any) => d._id !== doc._id);
        setRecommendedDoctors(updated);
        localStorage.setItem("mediflow_recommended_doctors", JSON.stringify(updated));
      } else {
        // Direct Booking from Search
        setSearchQuery("");
        setSearchResults([]);
      }

      alert(`Appointment successfully booked with ${doc.name}!`);

      window.dispatchEvent(new Event("appointmentUpdated"));
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setBookingDocId(null);
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

  return (
    <>
      <DemoNavbar title="Appointments" />
      <div className="flex min-h-screen bg-bgLight">
        <PatientSidebar
          activeTab="appointments"
          onTabChange={() => { }}
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

          {/* Search Bar */}
          <div className="mb-8">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for a specific doctor or specialization..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-primary transition-colors text-black"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-[#143A52] transition-colors disabled:opacity-50"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-8">
                <h2 className="text-[#1B4965] text-lg font-bold mb-4">
                  🔎 Search Results
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {searchResults.map((doc: any, i: number) => (
                    <div key={`search-${i}`} className="bg-white rounded-xl p-4 shadow-sm border border-[#E2E8F0] flex justify-between items-center">
                      <div>
                        <p className="font-bold text-[#1B4965] text-[15px]">
                          {doc.name}
                        </p>
                        <p className="text-[#64748B] text-[13px]">
                          {doc.specialization}
                        </p>
                        <p className="text-[#64748B] text-[13px]">
                          ⭐ {doc.rating} · {doc.isAvailable ? "Available" : "Unavailable"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => bookDoctor(doc, "Direct Booking")}
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
            )}

            {searchQuery && !isSearching && searchResults.length === 0 && (
              <div className="text-center p-4 bg-white rounded-xl border border-[#E2E8F0] text-secondary">
                No doctors found matching "{searchQuery}"
              </div>
            )}
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
                        onClick={() => bookDoctor(doc, "AI Recommended Booking")}
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
                  className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${tab === t
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayed.map((apt) => {
                    const docObj = typeof apt.doctor === 'object' && apt.doctor !== null ? apt.doctor : null;
                    const docName = docObj?.name || apt.doctorName || "Doctor";
                    const docSpec = docObj?.specialization || apt.specialization || "Consultation";
                    const docFee = docObj?.consultationFee ? `₹${docObj.consultationFee}` : apt.fee || "₹500";
                    const docRating = docObj?.rating || "4.5";
                    const docExp = docObj?.experience ? `${docObj.experience} years` : "10+ years";
                    const docLocation = "MediFlow Multi-Speciality Clinic";

                    return (
                      <div key={apt._id} className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                        {/* Status Header */}
                        <div className={`px-5 py-3 flex justify-between items-center border-b border-[#E2E8F0] ${apt.status === "cancelled" ? "bg-red-50" : apt.status === "completed" ? "bg-emerald-50" : "bg-[#F0F7FC]"}`}>
                          <span className="text-[13px] font-bold text-[#64748B] flex items-center gap-1.5">
                            <Calendar size={14} className="text-[#1B4965]" /> {formatDateTime(apt.dateTime)}
                          </span>
                          <Badge
                            variant={
                              apt.status === "cancelled" ? "danger"
                                : apt.status === "completed" ? "success"
                                  : "primary"
                            }
                            size="sm"
                          >
                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="p-5 flex-1">
                          {/* Doctor Info */}
                          <div className="flex gap-4 items-start mb-5 pb-5 border-b border-[#E2E8F0] border-dashed">
                            <div className="w-14 h-14 rounded-full bg-[#1B4965] flex items-center justify-center shrink-0 shadow-sm border-2 border-white outline outline-1 outline-[#E2E8F0]">
                              <User size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-[#1B4965] text-[17px] leading-tight">{docName}</h3>
                              <p className="text-[12px] font-bold text-[#0A7029] bg-[#E7FCE3] inline-block px-2 py-0.5 rounded-md mt-1 mb-3">{docSpec}</p>

                              <div className="grid grid-cols-2 gap-y-2.5 gap-x-2">
                                <span className="flex items-center gap-1.5 text-[12px] text-[#64748B] font-medium">
                                  <MapPin size={14} className="text-[#94A3B8]" /> {docLocation}
                                </span>
                                <span className="flex items-center gap-1.5 text-[12px] text-[#64748B] font-medium">
                                  <span className="text-[13px]">⭐</span> {docRating} Rating
                                </span>
                                <span className="flex items-center gap-1.5 text-[12px] text-[#64748B] font-medium">
                                  <span className="text-[#1B4965] font-bold text-[13px]">₹</span> Fee: {docFee}
                                </span>
                                <span className="flex items-center gap-1.5 text-[12px] text-[#64748B] font-medium">
                                  <span className="text-[13px]">🩺</span> Exp: {docExp}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Patient / Booking Info */}
                          <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
                            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Appointment Details</p>
                            <p className="text-[13px] text-[#334155] mb-1">
                              <span className="font-semibold text-[#1B4965]">Patient:</span> {apt.patientName || userName}
                            </p>
                            <p className="text-[13px] text-[#334155] leading-snug whitespace-pre-wrap mt-1">
                              {apt.reason?.startsWith("AI Summary:\n") ? (
                                <>
                                  <span className="font-semibold text-[#1B4965]">AI Summary:</span>
                                  {"\n"}{apt.reason.replace("AI Summary:\n", "")}
                                </>
                              ) : (
                                <>
                                  <span className="font-semibold text-[#1B4965]">Reason:</span>
                                  {" "}{apt.reason || "General Consultation"}
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        {tab === "upcoming" && apt.status !== "cancelled" && (
                          <div className="p-4 pt-0">
                            <button
                              onClick={() => handleCancel(apt._id)}
                              disabled={cancelling === apt._id}
                              className="w-full py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-red-600 text-[13px] font-bold hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
                            >
                              {cancelling === apt._id ? "Cancelling…" : "Cancel Appointment"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
