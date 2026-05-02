"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, RotateCcw, AlertCircle, CheckCircle2, Activity, Paperclip, ImageIcon, Camera } from "lucide-react";
import { triageApi, doctorsApi, appointmentsApi, type AgentResult, type Doctor } from "@/lib/api";

/* ─── Types ── */
interface Message { role: "ai" | "user"; text: string; image?: string; }

type Phase =
  | "chat"
  | "result"
  | "doctors"
  | "booked"
  | "error";

function riskColor(risk: string): string {
  const r = risk?.toLowerCase() || "";
  if (r.includes("high") || r.includes("emergency") || r.includes("critical"))
    return "text-red-600 bg-red-50 border-red-200";
  if (r.includes("moderate") || r.includes("medium"))
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-green-600 bg-green-50 border-green-200";
}

export default function HealthChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [phase, setPhase] = useState<Phase>("chat");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookingDoc, setBookingDoc] = useState<Doctor | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const isFirstMessage = useRef(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const user =
    typeof window !== "undefined"
      ? (() => { try { return JSON.parse(localStorage.getItem("mediflow_user") || "{}"); } catch { return {}; } })()
      : {};
  const userName: string = user?.name || "there";

  useEffect(() => {
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      pushAI(`Hi ${userName}! 👋 I'm your MediFlow Clinical Assistant. Please describe your symptoms, or upload a photo if you have a visible issue (e.g., a rash or swelling).`);
    }, 800);
    return () => clearTimeout(t);
  }, [userName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, phase, doctors, showAttachMenu]);

  function pushAI(text: string) { setMessages(p => [...p, { role: "ai", text }]); }
  function pushUser(text: string, image?: string) { setMessages(p => [...p, { role: "user", text, image }]); }

  const handleSend = async () => {
    const val = input.trim();
    if (!val || typing || phase !== "chat") return;
    setInput("");
    setShowAttachMenu(false);

    // ── YES / NO to book appointment ──
    if (doctors.length > 0) {
      const isYes = ["yes", "yes please", "book", "confirm", "ok", "sure", "haan", "ha"]
        .includes(val.toLowerCase());

      const isNo = ["no", "nahi", "nope", "cancel", "skip", "later", "nhi"]
        .includes(val.toLowerCase());

      if (isYes) {
        pushUser(val);
        const topDoctor = doctors[0];
        handleBook(topDoctor);
        return;
      }

      if (isNo) {
        pushUser(val);
        setDoctors([]);
        pushAI(`No problem! Here are my top recommendations based on availability and specialization. You can book anytime from the Appointments page.`);

        // Show top 3 doctors sorted by rating
        const sorted = [...doctors].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        const top3 = sorted.slice(0, 3);

        localStorage.setItem("mediflow_recommended_doctors", JSON.stringify(top3));
        window.dispatchEvent(new Event("recommendedDoctorsUpdated"));

        // Display as text recommendation
        top3.forEach((doc, i) => {
          setTimeout(() => {
            pushAI(`${i + 1}. **${doc.name}** — ${doc.specialization}\n⭐ Rating: ${doc.rating} · Available: ${(doc as any).isAvailable ? "Yes" : "No"}`);
          }, (i + 1) * 600);
        });

        setTimeout(() => {
          pushAI(`Visit the Appointments page to book with any of these doctors at your convenience.`);
          setPhase("result");
        }, top3.length * 600 + 600);
        return;
      }
    }

    pushUser(val);
    setTyping(true);

    try {
      if (isFirstMessage.current) {
        isFirstMessage.current = false;
        const res = await triageApi.start({ symptoms: val, patientName: userName });
        setSessionId(res.sessionId);
        setTyping(false);
        if (res.agentResult.done) handleDone(res.agentResult);
        else pushAI(res.agentResult.nextQuestion || "Tell me more about your symptoms.");
      } else {
        if (!sessionId) throw new Error("Session not initialised");
        const res = await triageApi.respond({ sessionId, answer: val });
        setTyping(false);
        if (res.agentResult.done) handleDone(res.agentResult);
        else pushAI(res.agentResult.nextQuestion || "Please continue...");
      }
    } catch (err: unknown) {
      setTyping(false);
      setErrorMsg(`Could not reach backend.`);
      setPhase("error");
    }
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowAttachMenu(false);

    // Simulate reading image
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      pushUser("Uploaded an image for analysis.", result);
      setTyping(true);

      // Fake AI response to image
      setTimeout(() => {
        setTyping(false);
        pushAI("I received your image. Our vision model is analyzing it. Can you describe any pain or itching associated with what's in the photo?");
        isFirstMessage.current = false; // Force it to continue triage
      }, 1500);
    };
    reader.readAsDataURL(file);
  };

  // const handleDone = (result: AgentResult) => {
  //   setAgentResult(result);
  //   setPhase("result");
  //   if (result.decision?.specialistNeeded) {
  //     fetchDoctors(result.decision.specialistNeeded);
  //   }
  // };

  const handleDone = (result: AgentResult) => {
    setAgentResult(result);
    setPhase("result");

    try {
      const risk = result.triage?.risk ?? "LOW";
      const normalizedRisk =
        risk.toLowerCase().includes("emergency") ||
          risk.toLowerCase().includes("high") ||
          risk.toLowerCase().includes("critical")
          ? "HIGH"
          : risk.toLowerCase().includes("moderate") ||
            risk.toLowerCase().includes("medium")
            ? "MEDIUM"
            : "LOW";

      const now = new Date().toISOString();

      const historyEntry = {
        riskLevel: normalizedRisk,
        confidence: (result.triage?.confidence ?? 0) / 100,
        aiSummary: result.decision?.recommendation ?? result.triage?.reason ?? "",
        severity: result.triage?.reason ?? "",
        specialist: result.decision?.specialistNeeded ?? "General Physician",
        suggestions: result.triage?.keySymptoms
          ? result.triage.keySymptoms.map((s) => `Monitor: ${s}`)
          : [],
        symptoms: result.triage?.keySymptoms?.join(", ") ?? "",
        appointmentBooked: false,
        createdAt: now,
        date: now,
      };

      // Accumulate — keep all past sessions, newest first
      const existing: any[] = [];
      try {
        const stored = localStorage.getItem("mediflow_health_history");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) existing.push(...parsed);
        }
      } catch {}
      existing.unshift(historyEntry); // add newest first
      localStorage.setItem("mediflow_health_history", JSON.stringify(existing));
      window.dispatchEvent(new Event("healthHistoryUpdated"));
    } catch { }

    if (result.decision?.specialistNeeded) {
      fetchDoctors(result.decision.specialistNeeded);
    }
  };

  // const fetchDoctors = async (specialization: string) => {
  //   try {
  //     const res = await doctorsApi.getAll({ specialization });
  //     setDoctors(res.doctors || []);
  //     setPhase("doctors");
  //     pushAI(`Here are available **${specialization}** doctors for you:`);
  //   } catch {
  //     setPhase("result");
  //   }
  // };

  const fetchDoctors = async (specialization: string) => {
    try {
      // The AI often returns compound values like "neurologist or orthopedic specialist"
      // Split into individual keywords and try each
      const specMap: Record<string, string> = {
        "cardiology": "cardiologist",
        "cardiologist": "cardiologist",
        "neurology": "neurologist",
        "neurologist": "neurologist",
        "pulmonology": "pulmonologist",
        "pulmonologist": "pulmonologist",
        "dermatology": "dermatologist",
        "dermatologist": "dermatologist",
        "orthopedics": "orthopedic",
        "orthopedic": "orthopedic",
        "general medicine": "general",
        "general physician": "general",
        "general": "general",
      };

      // Extract individual keywords from compound phrases
      const keywords = specialization
        .toLowerCase()
        .split(/\s+(?:or|and|\/)\s+|,\s*/)
        .map(s => s.replace(/\s*specialist\s*/g, "").trim())
        .filter(Boolean);

      let allDocs: Doctor[] = [];

      // Try each keyword
      for (const kw of keywords) {
        const mapped = specMap[kw] || kw;
        try {
          const res = await doctorsApi.getAll({ specialization: mapped });
          const docs = (res as any).data || [];
          allDocs.push(...docs);
        } catch { /* skip failed queries */ }
      }

      // Deduplicate by _id
      const seen = new Set<string>();
      allDocs = allDocs.filter(d => {
        if (seen.has(d._id)) return false;
        seen.add(d._id);
        return true;
      });

      // Fallback: if no matches, fetch ALL available doctors
      if (allDocs.length === 0) {
        try {
          const res = await doctorsApi.getAll();
          allDocs = (res as any).data || [];
        } catch { /* ignore */ }
      }

      if (allDocs.length > 0) {
        setDoctors(allDocs);
        setPhase("doctors");
        pushAI(`Based on your symptoms, I recommend seeing a **${specialization}** specialist. Here are the available doctors:`);
        setTimeout(() => {
          pushAI(`Would you like me to book an appointment? Reply **Yes** to confirm or select a doctor below.`);
          setPhase("chat");
        }, 800);
      } else {
        pushAI(`I recommend seeing a **${specialization}** specialist. Please book from the Appointments page.`);
        setPhase("result");
      }
    } catch {
      setPhase("result");
    }
  };

  // const handleBook = async (doc: Doctor) => {
  //   setBookingLoading(true);
  //   setBookingDoc(doc);
  //   pushAI(`Booking your appointment with ${doc.name}...`);
  //   try {
  //     await appointmentsApi.create({
  //       doctorId: doc._id, doctorName: doc.name, specialization: doc.specialization,
  //       patientName: userName, status: "upcoming", reason: agentResult?.triage?.reason || "AI Triage Referral",
  //     });
  //     pushAI(`✅ Confirmed! Appointment booked with **${doc.name}**.`);
  //     setPhase("booked");
  //   } catch {
  //     pushAI(`❌ Booking failed.`);
  //   } finally {
  //     setBookingLoading(false);
  //   }
  // };

  const handleBook = async (doc: Doctor) => {
    setBookingLoading(true);
    setBookingDoc(doc);
    setPhase("booked");
    pushAI(`Booking your appointment with **${doc.name}**...`);
    try {
      let patientId = null;
      try {
        const u = JSON.parse(localStorage.getItem("mediflow_user") || "{}");
        if (u?.id) patientId = u.id;
      } catch { /* ignore */ }

      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
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
        risk: agentResult?.triage?.risk || "NORMAL",
        reason: (agentResult?.triage?.keySymptoms && agentResult.triage.keySymptoms.length > 0) 
          ? agentResult.triage.keySymptoms.join(", ") 
          : (agentResult?.triage?.reason || "AI Triage Referral"),
        priority: agentResult?.triage?.risk === "EMERGENCY" 
          ? "emergency" 
          : agentResult?.triage?.risk === "HIGH"
          ? "warning"
          : "success",
      });
      pushAI(`✅ Appointment confirmed with **${doc.name}** (${doc.specialization})!\n⭐ Rating: ${doc.rating} · Fee: ₹${doc.consultationFee}\n📅 Scheduled for tomorrow. Check your Appointments page!`);

      // Update Care Plan
      try {
        const stored = localStorage.getItem("mediflow_health_history");
        if (stored) {
          const history = JSON.parse(stored);
          if (history[0]) {
            history[0].appointmentBooked = true;
            history[0].bookedDoctor = doc.name;
            history[0].bookedSpecialization = doc.specialization;
            history[0].bookedTime = new Date(
              Date.now() + 24 * 60 * 60 * 1000
            ).toLocaleDateString();
            history[0].assignedDoctor = {
              id: doc._id,
              name: doc.name,
              specialization: doc.specialization,
              rating: doc.rating,
              phone: doc.phone || "",
              isAvailable: doc.isAvailable,
            };
            history[0].appointmentSource = "chatbot";
            history[0].appointmentDate = new Date(
              Date.now() + 24 * 60 * 60 * 1000
            ).toISOString();
            localStorage.setItem("mediflow_health_history", JSON.stringify(history));
            window.dispatchEvent(new Event("healthHistoryUpdated"));
          }
        }
      } catch { }

      window.dispatchEvent(new Event("appointmentUpdated"));

      // Clear recommendations after booking
      localStorage.removeItem("mediflow_recommended_doctors");
      window.dispatchEvent(new Event("recommendedDoctorsUpdated"));
    } catch {
      pushAI(`❌ Booking failed. Please try again from the Appointments page.`);
      setPhase("doctors");
    } finally {
      setBookingLoading(false);
    }
  };
  const resetChat = () => {
    setMessages([]); setInput(""); setTyping(false); setPhase("chat");
    setSessionId(null); setAgentResult(null); setDoctors([]); setBookingDoc(null);
    setBookingLoading(false); setErrorMsg(""); isFirstMessage.current = true;
    setTimeout(() => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        pushAI(`Hi ${userName}! 👋 I'm your MediFlow Clinical Assistant. Tell me — what symptoms are you experiencing today?`);
      }, 800);
    }, 100);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const inputDisabled = typing || phase !== "chat";

  // Format time for WhatsApp style
  const getTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-[#EFEAE2] relative" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")', backgroundSize: '400px', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(239, 234, 226, 0.95)' }}>

      {/* WhatsApp Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#F0F2F5] border-b border-[#D1D7DB] shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#00A884] flex items-center justify-center">
          <Bot size={22} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-[#111B21] text-[16px] leading-tight">MediFlow Triage AI</h3>
          <p className="text-[#667781] text-[13px]">online</p>
        </div>
      </div>

      {/* ─── Chat Area ─── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Date bubble */}
        <div className="flex justify-center mb-4">
          <span className="bg-white/80 text-[#54656F] text-[12px] px-3 py-1 rounded-lg shadow-sm">TODAY</span>
        </div>

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] px-3 py-2 text-[14.5px] leading-relaxed shadow-sm relative ${m.role === "ai"
                ? "bg-white text-[#111B21] rounded-lg rounded-tl-none"
                : "bg-[#D9FDD3] text-[#111B21] rounded-lg rounded-tr-none"
                }`}
            >
              {/* Image attachment */}
              {m.image && (
                <div className="mb-2 rounded-md overflow-hidden bg-black/5">
                  <img src={m.image} alt="Uploaded symptom" className="max-w-full h-auto max-h-48 object-contain" />
                </div>
              )}

              <span className="whitespace-pre-wrap">{m.text}</span>
              <span className="float-right text-[11px] text-[#667781] ml-3 mt-2">{getTime()}</span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8696A0] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#8696A0] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#8696A0] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {/* Emergency alert */}
        {agentResult?.triage?.risk?.toLowerCase().includes("emergency") && (
          <div className="flex justify-start mt-2">
            <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-4 shadow-sm w-[85%]">
              <h4 className="font-bold text-red-700 text-[15px] flex items-center gap-2 mb-2">
                🚨 EMERGENCY DETECTED
              </h4>
              <p className="text-red-600 text-[13px] mb-3">
                Your symptoms indicate a medical emergency. Please seek immediate help.
              </p>
              <a
                href="tel:108"
                className="flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-[14px]"
              >
                📞 Call 108 Emergency
              </a>
            </div>
          </div>
        )}

        {/* Triage result */}
        {(phase === "result" || phase === "doctors" || phase === "booked") && agentResult?.triage && (
          <div className="flex justify-start mt-2">
            <div className="bg-white rounded-lg rounded-tl-none p-4 shadow-sm w-[85%] border-l-4 border-[#00A884]">
              <h4 className="font-bold text-[#111B21] mb-2 flex items-center gap-2"><Activity size={18} /> Triage Report</h4>
              <p className="text-sm text-[#54656F] mb-1"><strong>Risk:</strong> {agentResult.triage.risk}</p>
              <p className="text-sm text-[#54656F] mb-1"><strong>Symptoms:</strong> {agentResult.triage.keySymptoms?.join(", ")}</p>
              {agentResult.decision && (
                <p className="text-sm text-[#54656F] mt-2 border-t pt-2"><strong>Plan:</strong> {agentResult.decision.recommendation}</p>
              )}
            </div>
          </div>
        )}

        {/* Doctor recommendations */}
        {(phase === "doctors" || phase === "booked") && (
          <div className="flex justify-start flex-col gap-2 w-[85%]">
            {doctors.map((doc, i) => (
              <div key={doc._id || i} className="bg-white rounded-lg p-3 shadow-sm flex flex-col gap-2 border border-[#E9EDEF]">
                <div className="flex justify-between items-center">
                  <strong className="text-[#111B21]">{doc.name}</strong>
                  <span className="text-[11px] bg-[#E7FCE3] text-[#0A7029] px-2 py-0.5 rounded-md">Available</span>
                </div>
                <p className="text-[13px] text-[#54656F] m-0">{doc.specialization} · ⭐ {doc.rating}</p>
                <button
                  onClick={() => handleBook(doc)}
                  disabled={bookingLoading || phase === "booked"}
                  className="bg-[#00A884] text-white text-[13px] font-bold py-1.5 rounded mt-1 disabled:opacity-50"
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ─── WhatsApp Input Area ─── */}
      <div className="px-4 py-3 bg-[#F0F2F5] flex items-end gap-2 relative shrink-0">

        {/* Attachment Menu Popover */}
        {showAttachMenu && (
          <div className="absolute bottom-[60px] left-4 bg-white rounded-2xl shadow-lg p-2 flex flex-col gap-2 z-10 animate-fadeUp">
            <label className="flex items-center gap-3 px-4 py-2 hover:bg-[#F5F6F6] rounded-xl cursor-pointer transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#BF59CF] flex items-center justify-center"><ImageIcon size={20} color="white" /></div>
              <span className="text-[#111B21] font-medium text-[15px]">Photos & Videos</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <label className="flex items-center gap-3 px-4 py-2 hover:bg-[#F5F6F6] rounded-xl cursor-pointer transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#D3396D] flex items-center justify-center"><Camera size={20} color="white" /></div>
              <span className="text-[#111B21] font-medium text-[15px]">Camera</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        )}

        <button
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          disabled={inputDisabled}
          className="w-10 h-10 flex items-center justify-center shrink-0 text-[#54656F] hover:bg-[#E9EDEF] rounded-full transition-colors disabled:opacity-50"
        >
          <Paperclip size={24} />
        </button>

        <div className="flex-1 bg-white rounded-xl flex items-center px-4 py-2 border border-[#FFFFFF] focus-within:border-[#00A884]">
          <input
            className="flex-1 bg-transparent text-[15px] outline-none text-[#111B21] placeholder-[#8696A0] py-1"
            placeholder={inputDisabled ? "Please wait..." : "Type a message"}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={inputDisabled}
          />
        </div>

        {input.trim() ? (
          <button
            className="w-10 h-10 flex items-center justify-center shrink-0 bg-[#00A884] text-white rounded-full transition-colors shadow-sm"
            onClick={handleSend}
            disabled={inputDisabled}
          >
            <Send size={18} className="ml-1" />
          </button>
        ) : (
          <button
            className="w-10 h-10 flex items-center justify-center shrink-0 bg-[#00A884] text-white rounded-full transition-colors shadow-sm disabled:opacity-50"
            disabled={inputDisabled}
          >
            <Activity size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
