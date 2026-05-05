"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, Lock, Mail, ShieldCheck, User, Phone, Briefcase, GraduationCap, Building2, CreditCard } from "lucide-react";
import { PageContainer } from "../../../../components/ui/PageContainer";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { InputField } from "../../../../components/ui/InputField";
import { DemoNavbar } from "../../../../components/layout/DemoNavbar";
import { useMediFlowStore } from "../../../../store/useMediFlowStore";
import { authApi } from "../../../../lib/api";

export default function DoctorAuthPage() {
  const router = useRouter();
  const setRole = useMediFlowStore((state) => state.setRole);

  const [mode, setMode] = useState<"login" | "signup">("login");

  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [department, setDepartment] = useState("");
  const [consultationFee, setConsultationFee] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already logged in as doctor
  useEffect(() => {
    try {
      const token = localStorage.getItem("mediflow_doctor_token");
      if (token) router.replace("/demo/doctor");
    } catch { }
  }, [router]);

  const handleSubmit = async () => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    if (!email.trim() || !email.includes("@")) {
      newErrors.email = "Please enter a valid clinic email address";
      isValid = false;
    }

    if (password.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (mode === "signup") {
      if (!name.trim()) { newErrors.name = "Name is required"; isValid = false; }
      if (!specialization.trim()) { newErrors.specialization = "Specialization is required"; isValid = false; }
      if (!phone.trim()) { newErrors.phone = "Phone number is required"; isValid = false; }
    }

    setErrors(newErrors);
    if (!isValid) return;

    setLoading(true);

    try {
      let res;
      if (mode === "signup") {
        res = await authApi.registerDoctor({
          name, email, password, phone,
          specialization,
          qualification,
          experience: Number(experience) || 0,
          department,
          consultationFee: Number(consultationFee) || 0,
        });
      } else {
        res = await authApi.login({ email, password, platform: 'doctor' });
      }

      // Use doctor-specific keys to avoid overwriting patient session
      localStorage.setItem("mediflow_doctor_token", res.token);
      localStorage.setItem("mediflow_doctor_user", JSON.stringify(res.user));
      setRole("doctor");
      router.push("/demo/doctor");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed. Please try again.";
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageContainer maxWidth="sm">
        <Card padding="lg" className="mt-8 mb-12 animate-fadeUp">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Stethoscope className="text-white" size={32} />
          </div>

          <h2 className="font-display text-2xl text-primary font-bold text-center mt-4">
            {mode === "login" ? "Doctor Sign In" : "Doctor Registration"}
          </h2>
          <p className="text-secondary text-sm text-center mt-1 leading-relaxed px-4">
            {mode === "login"
              ? "Enter your credentials to access the MediFlow dashboard."
              : "Register your professional profile to join MediFlow network."}
          </p>

          <div className="flex bg-bgSoft p-1 rounded-xl mt-6 relative z-10 w-full mb-6 max-w-sm mx-auto">
            <button
              onClick={() => { setMode("login"); setErrors({}); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition relative ${mode === "login" ? "bg-white text-primary shadow-sm" : "text-primary/60 hover:text-primary"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setErrors({}); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition relative ${mode === "signup" ? "bg-white text-primary shadow-sm" : "text-primary/60 hover:text-primary"}`}
            >
              Sign Up
            </button>
          </div>

          {errors.form && (
            <div className="mt-4 bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-danger text-sm font-medium">
              {errors.form}
            </div>
          )}

          <div className="mt-4 space-y-4">
            {mode === "signup" && (
              <>
                <InputField
                  label="Full Name"
                  placeholder="Dr. John Doe"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: "" }); }}
                  error={errors.name}
                  leftIcon={<User size={16} />}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Specialization"
                    placeholder="e.g. Cardiologist"
                    value={specialization}
                    onChange={(e) => { setSpecialization(e.target.value); setErrors({ ...errors, specialization: "" }); }}
                    error={errors.specialization}
                    leftIcon={<Briefcase size={16} />}
                    required
                  />
                  <InputField
                    label="Department"
                    placeholder="e.g. Cardiology"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    leftIcon={<Building2 size={16} />}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Phone Number"
                    placeholder="123-456-7890"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setErrors({ ...errors, phone: "" }); }}
                    error={errors.phone}
                    leftIcon={<Phone size={16} />}
                    required
                  />
                  <InputField
                    label="Years of Experience"
                    type="number"
                    placeholder="e.g. 10"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    leftIcon={<Briefcase size={16} />}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Qualification"
                    placeholder="e.g. MD, MBBS"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    leftIcon={<GraduationCap size={16} />}
                  />
                  <InputField
                    label="Consultation Fee (₹)"
                    type="number"
                    placeholder="e.g. 500"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    leftIcon={<CreditCard size={16} />}
                  />
                </div>
              </>
            )}

            <InputField
              label="Professional Email"
              type="email"
              placeholder="doctor@hospital.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: "" }); }}
              error={errors.email}
              leftIcon={<Mail size={16} />}
              required
            />

            <InputField
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: "" }); }}
              error={errors.password}
              leftIcon={<Lock size={16} />}
              required
            />
          </div>

          {mode === "login" && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="rounded border-bgSoft text-accent focus:ring-accent" />
                <label htmlFor="remember" className="text-sm text-primary/70 cursor-pointer">Remember me</label>
              </div>
              <a href="#" className="text-sm text-accent hover:underline font-medium">Forgot password?</a>
            </div>
          )}

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
            onClick={handleSubmit}
            loading={loading}
          >
            {mode === "login" ? "Sign In to Dashboard →" : "Create Account & Sign In →"}
          </Button>

          {mode === "login" ? (
            <div className="mt-6 text-center text-sm text-primary/60">
              Don&apos;t have an account?{" "}
              <button onClick={() => { setMode("signup"); setErrors({}); }} className="text-accent font-medium hover:underline">
                Register as a Doctor
              </button>
            </div>
          ) : (
            <div className="mt-6 text-center text-sm text-primary/60">
              Already have an account?{" "}
              <button onClick={() => { setMode("login"); setErrors({}); }} className="text-accent font-medium hover:underline">
                Sign In
              </button>
            </div>
          )}
        </Card>
      </PageContainer>
    </>
  );
}
