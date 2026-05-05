"use client";


import React from "react";
import { useRouter } from "next/navigation";
import { User, Stethoscope, CheckCircle } from "lucide-react";
import { PageContainer } from "../../components/ui/PageContainer";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { DemoNavbar } from "../../components/layout/DemoNavbar";
import { useMediFlowStore } from "../../store/useMediFlowStore";

export default function DemoRoleSelection() {
  const router = useRouter();
  const setRole = useMediFlowStore((state) => state.setRole);

  const handlePatientClick = () => {
    setRole("patient");
    router.push("/demo/patient/auth");
  };

  const handleDoctorClick = () => {
    setRole("doctor");
    router.push("/demo/doctor/auth");
  };

  /* 
  const handleAdminClick = () => {
    setRole("admin");
    router.push("/demo/admin/auth");
  };
  */

  return (
    <>
      <PageContainer maxWidth="lg" className="flex flex-col items-center py-16 animate-fadeUp">
        <div className="text-center">
          <p className="text-accent font-semibold text-xs tracking-widest uppercase">
            MEDIFLOW AI DEMO
          </p>
          <h1 className="font-display text-4xl text-primary font-bold mt-2">
            How will you use MediFlow today?
          </h1>
          <p className="font-sans text-secondary text-base mt-3 max-w-md mx-auto text-center leading-relaxed">
            Select your role to enter the live demo environment. No signup required — explore the full AI triage flow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 w-full max-w-4xl mx-auto">
          {/* Patient Card */}
          <Card hover padding="lg" onClick={handlePatientClick} className="relative">
            <div className="w-14 h-14 bg-bgLight rounded-2xl flex items-center justify-center mb-4">
              <User className="text-primary" size={28} />
            </div>

            <div className="absolute top-8 right-8">
              <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full border border-success/30 uppercase tracking-wide">
                LIVE DEMO
              </span>
            </div>

            <h2 className="font-display text-xl text-primary font-bold mt-4">
              Enter as Patient
            </h2>
            <p className="text-sm text-secondary mt-2 leading-relaxed">
              Experience the AI triage flow firsthand. Enter symptoms, get risk assessment, and see personalized care recommendations.
            </p>

            <div className="mt-4 space-y-2">
              {["AI Symptom Analysis", "Real-time Risk Scoring", "Specialist Recommendations"].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle className="text-success w-3.5 h-3.5" />
                  <span className="text-sm text-primary/70">{feature}</span>
                </div>
              ))}
            </div>

            <Button variant="primary" className="w-full mt-6" onClick={(e) => {
              e.stopPropagation();
              handlePatientClick();
            }}>
              Enter as Patient →
            </Button>
          </Card>

          {/* Doctor Card */}
          <Card hover padding="lg" onClick={handleDoctorClick} className="relative cursor-pointer">
            <div className="w-14 h-14 bg-bgLight rounded-2xl flex items-center justify-center mb-4">
              <Stethoscope className="text-secondary" size={28} />
            </div>

            <div className="absolute top-8 right-8">
              <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full border border-success/30 uppercase tracking-wide">
                LIVE DEMO
              </span>
            </div>

            <h2 className="font-display text-xl text-primary font-bold mt-4">
              Enter as Doctor / Clinic
            </h2>
            <p className="text-sm text-secondary mt-2 leading-relaxed">
              Access the doctor dashboard, patient queue, and AI-assisted triage management system.
            </p>

            <div className="mt-4 space-y-2">
              {["Patient Queue Management", "AI Triage Override", "Analytics Dashboard"].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle className="text-secondary w-3.5 h-3.5" />
                  <span className="text-sm text-primary/70">{feature}</span>
                </div>
              ))}
            </div>

            <Button variant="primary" className="w-full mt-6" onClick={(e) => {
              e.stopPropagation();
              handleDoctorClick();
            }}>
              Doctor Dashboard →
            </Button>
          </Card>

          {/* Admin Card */}
          {/* <Card hover padding="lg" onClick={handleAdminClick} className="relative cursor-pointer">
            <div className="w-14 h-14 bg-bgLight rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck className="text-accent" size={28} />
            </div>

            <div className="absolute top-8 right-8">
              <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full border border-success/30 uppercase tracking-wide">
                LIVE DEMO
              </span>
            </div>

            <h2 className="font-display text-xl text-primary font-bold mt-4">
              Enter as Hospital Admin
            </h2>
            <p className="text-sm text-secondary mt-2 leading-relaxed">
              Manage hospital operations, monitor global patient queues, and oversee doctor availability.
            </p>

            <div className="mt-4 space-y-2">
              {["Global Analytics", "Doctor Attendance", "Bed Management"].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle className="text-accent w-3.5 h-3.5" />
                  <span className="text-sm text-primary/70">{feature}</span>
                </div>
              ))}
            </div>

            <Button variant="primary" className="w-full mt-6" onClick={(e) => {
              e.stopPropagation();
              handleAdminClick();
            }}>
              Admin Portal →
            </Button>
          </Card> */}
        </div>

        <p className="mt-10 text-center text-xs text-primary/40">
          🔒 Demo environment · No real patient data · HIPAA-safe sandbox
        </p>
      </PageContainer>
    </>
  );
}
