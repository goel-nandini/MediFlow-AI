"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Brain,
  AlertTriangle,
  Bell,
  HeartPulse,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  BarChart2,
  Bot,
  LayoutDashboard,
  FileText,
  Smartphone,
  Lock,
  Key,
  Shield,
  UserCheck,
  Calendar,
} from "lucide-react";

// ─── Hero Section ─────────────────────────────────────────────────────────────

function HeroSection() {
  const [activeTimelineStep, setActiveTimelineStep] = useState(0);

  const timelineSteps = [
    { icon: MessageSquare, label: "Symptoms" },
    { icon: Activity, label: "Triage" },
    { icon: Key, label: "Identity" },
    { icon: Shield, label: "Insurance" },
    { icon: UserCheck, label: "Match" },
    { icon: Calendar, label: "Book" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimelineStep((prev) => (prev + 1) % timelineSteps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [timelineSteps.length]);

  return (
    <section
      id="hero"
      className="min-h-[calc(100vh-64px)] flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-16 w-full max-w-7xl mx-auto
        bg-gradient-to-br from-bgLight via-white to-bgSoft
        dark:bg-gradient-to-br dark:from-primary dark:via-[#1a3d58] dark:to-[#163248]"
    >
      <div className="grid lg:grid-cols-2 items-center gap-12 w-full">
        {/* Left Column */}
        <div>
          <span
            className="inline-block mb-6 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase
              bg-accent/20 border border-accent/50 text-primary
              dark:bg-accent/10 dark:border-accent/30 dark:text-accent"
          >
            AI-POWERED MEDICAL TRIAGE
          </span>

          <h1 className="font-display font-bold leading-tight text-4xl sm:text-5xl lg:text-6xl">
            <span className="text-primary dark:text-white block">
              Advancing
            </span>
            <span className="text-accent block">Clinical</span>
            <span className="text-primary dark:text-white block">
              Superintelligence
            </span>
          </h1>

          <p
            className="font-sans text-base lg:text-lg leading-relaxed max-w-lg mt-6
              text-primary/70 dark:text-white/70"
          >
            MediFlow AI is the intelligence layer that triages patients in real
            time — reducing wait times, prioritizing emergencies, and empowering
            doctors with instant insights.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#contact"
              className="px-7 py-3 rounded-xl font-semibold text-sm transition shadow-lg
                bg-primary text-white hover:bg-secondary
                dark:bg-accent dark:text-primary dark:hover:bg-secondary"
            >
              Book Demo
            </a>
            <a
              href="#platform"
              className="px-7 py-3 rounded-xl font-semibold text-sm transition
                bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white
                dark:bg-transparent dark:border-2 dark:border-white/40 dark:text-white dark:hover:bg-white/10"
            >
              Explore the Platform
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 items-center text-sm">
            {["HIPAA Compliant", "99.9% Uptime", "< 2 min Triage"].map((t) => (
              <span
                key={t}
                className="flex items-center gap-2 text-primary/60 dark:text-white/60"
              >
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col items-center lg:items-end justify-center relative w-full gap-10 mt-12 lg:mt-0">
          {/* Chat UI Mockup */}
          <div className="float-card w-full max-w-[420px] mx-auto lg:mx-0 z-10">
            {/* Browser chrome bar */}
            <div
              className="rounded-t-2xl px-4 py-3 flex items-center gap-2 border-b
                bg-gray-100 border-gray-200
                dark:bg-[#0f2d42] dark:border-white/10"
            >
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-auto text-xs text-gray-400 dark:text-white/40 font-mono">
                MediFlow AI · Live
              </span>
            </div>

            {/* Chat card body */}
            <div
              className="rounded-b-2xl shadow-2xl p-5 border
                bg-white border-bgSoft
                dark:bg-[#163248] dark:border-white/10"
            >
              {/* Chat header */}
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-primary dark:text-white flex-1">
                  MediFlow AI Chat
                </span>
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-success text-xs font-medium">Live</span>
              </div>

              {/* Messages */}
              <div className="mt-4 flex flex-col gap-3">
                <div
                  className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[80%]
                    bg-bgLight text-primary
                    dark:bg-white/10 dark:text-white"
                >
                  Hello! I'm MediFlow AI. What symptoms are you experiencing
                  today?
                </div>
                <div
                  className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[80%] ml-auto text-right
                    bg-primary text-white
                    dark:bg-accent dark:text-primary"
                >
                  Severe chest pain, difficulty breathing for 20 minutes
                </div>
                <div
                  className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[80%]
                    bg-bgLight text-primary
                    dark:bg-white/10 dark:text-white"
                >
                  I'm flagging this as{" "}
                  <span className="text-danger font-bold">HIGH PRIORITY</span>
                  . Alerting the emergency team now.
                </div>
                <div className="mt-1 mx-auto w-fit">
                  <div
                    className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide
                      bg-danger/10 text-danger border border-danger/40"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    EMERGENCY — DOCTOR NOTIFIED
                  </div>
                </div>
              </div>

              <p className="text-xs mt-3 pt-3 border-t border-bgSoft dark:border-white/10 text-secondary dark:text-accent">
                Dr. Ahmed has been assigned
              </p>
            </div>
          </div>

          {/* Dynamic Timeline (Image 1/2 Reference) */}
          <div className="w-full max-w-[480px] mx-auto lg:mx-0">
            <div className="relative flex justify-between items-center w-full">
              {/* Connecting line background */}
              <div className="absolute top-6 left-0 w-full h-0.5 bg-bgSoft dark:bg-white/10 -z-10" />
              
              {/* Active progress line */}
              <div 
                className="absolute top-6 left-0 h-0.5 bg-accent transition-all duration-500 ease-in-out -z-10"
                style={{ width: `${(activeTimelineStep / (timelineSteps.length - 1)) * 100}%` }}
              />

              {timelineSteps.map((step, i) => {
                const Icon = step.icon;
                const isActive = i <= activeTimelineStep;
                const isCurrent = i === activeTimelineStep;

                return (
                  <div key={step.label} className="flex flex-col items-center gap-3 bg-transparent">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2
                        ${
                          isActive
                            ? "border-accent bg-accent/10 dark:bg-accent/20"
                            : "border-bgSoft dark:border-white/20 bg-white dark:bg-[#163248]"
                        }
                        ${isCurrent ? "glow-active scale-110" : "scale-100"}
                      `}
                    >
                      <Icon
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                          isActive
                            ? "text-accent"
                            : "text-primary/40 dark:text-white/30"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-semibold tracking-wide transition-colors duration-300 ${
                        isCurrent
                          ? "text-primary dark:text-white"
                          : "text-primary/50 dark:text-white/50"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 text-center">
              <button className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-bgSoft dark:border-white/20 bg-white/50 dark:bg-white/5 text-sm font-medium text-primary dark:text-white hover:bg-bgSoft/50 dark:hover:bg-white/10 transition-colors backdrop-blur-sm">
                 <MessageSquare className="w-4 h-4 text-accent" />
                 AI Chat & Triage
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const flowSteps = [
    {
      icon: MessageSquare,
      label: "Patient Starts Chat",
      sub: "Web, Mobile, or Kiosk",
    },
    {
      icon: Brain,
      label: "AI Analyzes Symptoms",
      sub: "NLP + Clinical Protocols",
    },
    {
      icon: AlertTriangle,
      label: "Priority Assigned",
      sub: "Emergency / High / Normal",
    },
    {
      icon: Bell,
      label: "Doctor Notified",
      sub: "Real-time Dashboard Alert",
    },
    {
      icon: HeartPulse,
      label: "Care Delivered",
      sub: "Outcome Logged + Feedback",
    },
  ];

  const platformCards = [
    {
      icon: Activity,
      color: "text-accent",
      title: "Real-Time Processing",
      desc: "Symptoms analyzed and triaged in under 90 seconds using clinically validated AI.",
    },
    {
      icon: ShieldCheck,
      color: "text-success",
      title: "Clinically Validated",
      desc: "Protocols aligned with Manchester Triage System and WHO guidelines.",
    },
    {
      icon: BarChart2,
      color: "text-secondary",
      title: "Outcomes Tracked",
      desc: "Every triage logged. Doctors get full history and AI confidence scores.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 px-8 lg:px-16 bg-white dark:bg-[#163248]"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <p className="text-accent font-semibold text-sm uppercase tracking-widest">
          The Platform
        </p>
        <h2 className="font-display text-4xl font-bold text-primary dark:text-white mt-2">
          From Symptom to Solution — In Minutes
        </h2>
        <p className="text-secondary dark:text-white/70 text-lg mt-3 max-w-2xl mx-auto">
          MediFlow AI connects patients, triage AI, and doctors in one seamless
          real-time flow.
        </p>
      </div>

      {/* Flow diagram */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0 mt-16">
        {flowSteps.map((step, i) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-3 text-center max-w-[160px]">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg border-2 
                    bg-bgLight border-secondary
                    dark:bg-white/10 dark:border-accent/40`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      i === 1 ? "text-accent" : i === 2 ? "text-warning" : i === 4 ? "text-success" : "text-primary dark:text-white"
                    }`}
                  />
                </div>
                <p className="text-sm font-semibold font-display leading-tight text-primary dark:text-white">
                  {step.label}
                </p>
                <p className="text-xs text-secondary dark:text-white/50">
                  {step.sub}
                </p>
              </div>

              {i < flowSteps.length - 1 && (
                <>
                  <ChevronRight className="hidden lg:block w-5 h-5 text-secondary/50 dark:text-white/30 mx-3 shrink-0" />
                  <ChevronDown className="lg:hidden w-5 h-5 text-secondary/50 dark:text-white/30" />
                </>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
        {platformCards.map(({ icon: Icon, color, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl p-6 border 
              bg-bgSoft border-bgLight
              dark:bg-white/5 dark:border-white/10"
          >
            <Icon className={`w-6 h-6 ${color} mb-3`} />
            <h3 className="font-display font-semibold text-base mb-1 text-primary dark:text-white">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-secondary dark:text-white/60">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────

function FeaturesSection() {
  const featureCards = [
    {
      icon: Bot,
      iconColor: "text-accent",
      iconBg: "bg-accent/10",
      title: "Conversational AI Triage",
      desc: "Natural language symptom collection with clinical-grade accuracy.",
    },
    {
      icon: LayoutDashboard,
      iconColor: "text-primary dark:text-white",
      iconBg: "bg-primary/10 dark:bg-white/10",
      title: "Doctor Dashboard",
      desc: "Live patient queue with priority flags, history, and one-click assignment.",
    },
    {
      icon: Bell,
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      title: "Smart Alerts",
      desc: "Instant push + dashboard alerts for emergency cases. Zero delay.",
    },
    {
      icon: FileText,
      iconColor: "text-secondary dark:text-accent",
      iconBg: "bg-secondary/10 dark:bg-accent/10",
      title: "Auto-Documentation",
      desc: "AI generates structured SOAP notes after each triage. Saves 40% admin time.",
    },
    {
      icon: Smartphone,
      iconColor: "text-accent",
      iconBg: "bg-accent/10",
      title: "Mobile-First Design",
      desc: "Patients triage from any device. Fully responsive, PWA-ready.",
    },
    {
      icon: Lock,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      title: "HIPAA Compliant",
      desc: "End-to-end encryption, audit logs, and role-based access control.",
    },
  ];

  return (
    <section
      id="features"
      className="py-24 px-8 lg:px-16 bg-bgLight dark:bg-primary"
    >
      <div className="text-center mb-12">
        <p className="text-accent font-semibold text-sm uppercase tracking-widest">
          Features
        </p>
        <h2 className="font-display text-4xl font-bold mt-2 text-primary dark:text-white">
          Everything Your Team Needs
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {featureCards.map(({ icon: Icon, iconColor, iconBg, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl p-6 shadow-sm hover:shadow-md border hover:-translate-y-1 transition-all duration-200
              bg-white border-bgSoft
              dark:bg-white/5 dark:border-white/10"
          >
            <div
              className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-4`}
            >
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <h3 className="font-display font-semibold text-base text-primary dark:text-white">
              {title}
            </h3>
            <p className="text-sm leading-relaxed mt-1 text-secondary dark:text-white/60">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Triage Status Section ────────────────────────────────────────────────────

function TriageStatusSection() {
  return (
    <section className="py-20 px-8 lg:px-16 bg-primary dark:bg-[#0f2d42]">
      <div className="text-center mb-12">
        <h2 className="font-display text-4xl font-bold text-white">
          Real-Time Priority Intelligence
        </h2>
        <p className="text-accent text-lg mt-3">
          Every patient gets the right level of care, instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {/* Emergency */}
        <div className="bg-danger/10 border border-danger/30 rounded-2xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-danger mx-auto mb-3" />
          <p className="font-display font-bold text-danger text-xl">
            EMERGENCY
          </p>
          <p className="text-white/70 text-sm mt-1">
            Immediate intervention required
          </p>
          <div className="w-full h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
            <div className="w-1/4 h-full bg-danger rounded-full" />
          </div>
        </div>

        {/* High Priority */}
        <div className="bg-warning/10 border border-warning/30 rounded-2xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-3" />
          <p className="font-display font-bold text-warning text-xl">
            HIGH PRIORITY
          </p>
          <p className="text-white/70 text-sm mt-1">Seen within 30 minutes</p>
          <div className="w-full h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
            <div className="w-1/2 h-full bg-warning rounded-full" />
          </div>
        </div>

        {/* Normal */}
        <div className="bg-success/10 border border-success/30 rounded-2xl p-6 text-center">
          <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-3" />
          <p className="font-display font-bold text-success text-xl">NORMAL</p>
          <p className="text-white/70 text-sm mt-1">Standard care pathway</p>
          <div className="w-full h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
            <div className="w-3/4 h-full bg-success rounded-full" />
          </div>
        </div>
      </div>

      <p className="text-white/40 text-xs text-center mt-6">
        Priority classification powered by Manchester Triage System protocols
      </p>
    </section>
  );
}

// ─── Stats Section ────────────────────────────────────────────────────────────

function StatsSection() {
  const stats = [
    { value: "1,200+", label: "Patients Triaged Daily" },
    { value: "< 90s", label: "Average Triage Time" },
    { value: "98.4%", label: "AI Accuracy Rate" },
    { value: "50+", label: "Hospitals Onboarded" },
  ];

  return (
    <section className="py-20 px-8 lg:px-16 bg-bgSoft dark:bg-[#1a3d58]">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center max-w-6xl mx-auto">
        {stats.map(({ value, label }) => (
          <div key={label} className="border-t-2 border-accent pt-6">
            <p className="font-display font-bold text-5xl text-primary dark:text-white">
              {value}
            </p>
            <p className="text-sm mt-2 text-secondary dark:text-white/60">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "MediFlow cut our average triage time from 12 minutes to under 90 seconds. Emergency response has never been faster.",
      name: "Dr. Priya Sharma",
      role: "Chief of Emergency Medicine, Apollo Delhi",
      initials: "PS",
      avatarBg: "bg-primary dark:bg-white/20",
      avatarText: "text-white",
    },
    {
      quote:
        "The AI priority system is incredibly accurate. We've seen zero missed emergencies since deployment.",
      name: "Dr. Rohan Mehta",
      role: "Medical Director, Fortis Hospitals",
      initials: "RM",
      avatarBg: "bg-accent dark:bg-accent",
      avatarText: "text-primary dark:text-[#163248]",
    },
    {
      quote:
        "Finally, a triage tool built for Indian healthcare infrastructure. Works on any device, even low-bandwidth networks.",
      name: "Dr. Ayesha Khan",
      role: "HOD Casualty, AIIMS New Delhi",
      initials: "AK",
      avatarBg: "bg-secondary dark:bg-secondary/50",
      avatarText: "text-white",
    },
  ];

  return (
    <section className="py-20 px-8 lg:px-16 bg-white dark:bg-[#163248]">
      <h2 className="font-display text-3xl font-bold text-center text-primary dark:text-white">
        Trusted by Healthcare Leaders
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 max-w-6xl mx-auto">
        {testimonials.map(
          ({ quote, name, role, initials, avatarBg, avatarText }) => (
            <div
              key={name}
              className="rounded-2xl p-6 border 
                bg-bgLight border-bgSoft
                dark:bg-white/5 dark:border-white/10"
            >
              <p className="text-accent/30 font-serif text-6xl leading-none mb-2 select-none">
                "
              </p>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-warning text-sm">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-sm leading-relaxed text-primary/80 dark:text-white/80">
                {quote}
              </p>
              <div className="flex items-center gap-3 mt-5">
                <div
                  className={`w-10 h-10 rounded-full ${avatarBg} ${avatarText} font-bold flex items-center justify-center text-sm shrink-0`}
                >
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-sm text-primary dark:text-white">
                    {name}
                  </p>
                  <p className="text-xs text-secondary dark:text-white/60">
                    {role}
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}


// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-primary text-white/60 py-10 px-8 lg:px-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-7xl mx-auto">
        <div>
          <p className="font-display font-bold text-white text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />
            MediFlow AI
          </p>
          <p className="text-white/40 text-xs mt-1">
            AI-Powered Triage for Modern Healthcare
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-xs text-white/50">
          {["Privacy Policy", "Terms", "Contact"].map((link) => (
            <a
              key={link}
              href="#"
              className="hover:text-white transition-colors duration-150"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 mt-6 pt-6 text-center text-white/30 text-xs max-w-7xl mx-auto">
        © {new Date().getFullYear()} MediFlow AI. All rights reserved.
      </div>
    </footer>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="w-full">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TriageStatusSection />
      <StatsSection />
      <TestimonialsSection />

      <Footer />
    </main>
  );
}
