"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, User, Mail, Calendar, ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { DemoNavbar } from "@/components/layout/DemoNavbar";
import { useMediFlowStore } from "@/store/useMediFlowStore";

export default function PatientAuthPage() {
  const router = useRouter();
  const setPatientInfo = useMediFlowStore((state) => state.setPatientInfo);

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [nameError, setNameError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (name.trim().length < 2) {
      setNameError("Please enter a valid name (min 2 characters)");
      return;
    }
    
    setNameError("");
    setLoading(true);
    
    setTimeout(() => {
      setPatientInfo({ name, email, age });
      router.push("/demo/patient/form");
    }, 1200);
  };

  return (
    <>
      <DemoNavbar showBack backHref="/demo" title="Patient Login" step={1} totalSteps={3} />
      <PageContainer maxWidth="sm">
        <Card padding="lg" className="mt-8 animate-fadeUp">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <UserCircle className="text-white" size={32} />
          </div>
          
          <h2 className="font-display text-2xl text-primary font-bold text-center mt-4">
            Welcome to MediFlow AI
          </h2>
          <p className="text-secondary text-sm text-center mt-1 leading-relaxed px-4">
            Enter your details to begin the triage process. This is a demo — use any name.
          </p>

          <div className="bg-bgLight rounded-xl p-1 flex mt-6">
            <button
              className={`flex-1 py-2 rounded-lg text-sm transition-all duration-200 ${
                activeTab === "login" 
                  ? "bg-white shadow-sm text-primary font-semibold" 
                  : "text-primary/50 hover:text-primary"
              }`}
              onClick={() => setActiveTab("login")}
            >
              Log In
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-sm transition-all duration-200 ${
                activeTab === "signup" 
                  ? "bg-white shadow-sm text-primary font-semibold" 
                  : "text-primary/50 hover:text-primary"
              }`}
              onClick={() => setActiveTab("signup")}
            >
              Sign Up
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <InputField
              label="Full Name"
              placeholder="e.g. Arjun Sharma"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError && e.target.value.trim().length >= 2) {
                  setNameError("");
                }
              }}
              error={nameError}
              leftIcon={<User size={16} />}
              required
            />
            
            <InputField
              label="Email Address"
              type="email"
              placeholder="arjun@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              hint="Optional — for demo session tracking"
            />
            
            <InputField
              label="Age"
              type="number"
              placeholder="e.g. 28"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              leftIcon={<Calendar size={16} />}
            />
          </div>

          <div className="mt-4 bg-bgSoft rounded-xl p-3 flex gap-2 items-start">
            <ShieldCheck className="text-success shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-primary/60 leading-relaxed">
              Demo mode · No data stored on servers · Session data in browser only
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full mt-6"
            onClick={handleContinue}
            loading={loading}
            disabled={name.trim().length < 2 && !nameError}
          >
            Continue to Symptom Check →
          </Button>
        </Card>
      </PageContainer>
    </>
  );
}
