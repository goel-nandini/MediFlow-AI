"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, Lock, Mail, ShieldCheck } from "lucide-react";
import { PageContainer } from "../../../../components/ui/PageContainer";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { InputField } from "../../../../components/ui/InputField";
import { DemoNavbar } from "../../../../components/layout/DemoNavbar";
import { useMediFlowStore } from "../../../../store/useMediFlowStore";

export default function DoctorAuthPage() {
  const router = useRouter();
  const setRole = useMediFlowStore((state) => state.setRole);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    let isValid = true;

    if (!email.trim() || !email.includes("@")) {
      setEmailError("Please enter a valid clinic email address");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (password.trim().length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!isValid) return;

    setLoading(true);
    setRole("doctor");

    // Simulate authentication delay
    setTimeout(() => {
      router.push("/demo/doctor");
    }, 1200);
  };

  return (
    <>
      <DemoNavbar showBack backHref="/demo" title="Doctor & Clinic Portal" step={1} totalSteps={1} />
      <PageContainer maxWidth="sm">
        <Card padding="lg" className="mt-8 animate-fadeUp">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Stethoscope className="text-white" size={32} />
          </div>

          <h2 className="font-display text-2xl text-primary font-bold text-center mt-4">
            Physician Sign In
          </h2>
          <p className="text-secondary text-sm text-center mt-1 leading-relaxed px-4">
            Enter your credentials to access the MediFlow dashboard.
          </p>

          <div className="mt-8 space-y-4">
            <InputField
              label="Professional Email"
              type="email"
              placeholder="doctor@hospital.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              error={emailError}
              leftIcon={<Mail size={16} />}
              required
            />

            <InputField
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              error={passwordError}
              leftIcon={<Lock size={16} />}
              required
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border-bgSoft text-accent focus:ring-accent" />
              <label htmlFor="remember" className="text-sm text-primary/70 cursor-pointer">Remember me</label>
            </div>
            <a href="#" className="text-sm text-accent hover:underline font-medium">Forgot password?</a>
          </div>

          <div className="mt-6 bg-bgSoft rounded-xl p-3 flex gap-2 items-start">
            <ShieldCheck className="text-success shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-primary/60 leading-relaxed">
              Secure clinical environment. Access restricted to authorized medical personnel only.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full mt-6"
            onClick={handleLogin}
            loading={loading}
          >
            Sign In to Dashboard →
          </Button>

          <div className="mt-6 text-center text-sm text-primary/60">
            Don't have an account? <a href="#" className="text-accent font-medium hover:underline">Request clinic access</a>
          </div>
        </Card>
      </PageContainer>
    </>
  );
}
