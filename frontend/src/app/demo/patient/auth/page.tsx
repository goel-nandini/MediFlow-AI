"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserCircle, User, Mail, Lock, Ruler, Weight, Droplets,
  Users, ShieldCheck, Eye, EyeOff, ChevronDown
} from "lucide-react";
import { PageContainer } from "../../../../components/ui/PageContainer";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { InputField } from "../../../../components/ui/InputField";
import { DemoNavbar } from "../../../../components/layout/DemoNavbar";
import { authApi } from "../../../../lib/api";

const BLOOD_GROUPS = ["Select blood group", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const GENDERS = ["Select gender", "Male", "Female", "Non-binary", "Prefer not to say"];
const CONDITIONS = ["Diabetes", "Hypertension", "Asthma", "Heart Disease", "Thyroid Disorder", "Arthritis", "Depression/Anxiety", "None"];

export default function PatientAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-redirect if already logged in as patient
  useEffect(() => {
    try {
      const token = localStorage.getItem("mediflow_token");
      if (token) router.replace("/demo/patient/dashboard");
    } catch { }
  }, [router]);

  /* ── Sign-up fields ── */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [gender, setGender] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");




  const toggleCondition = (c: string) =>
    setConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  /* ── Validation ── */
  const validateSignup = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "Min 2 characters";
    if (!email.includes("@")) e.email = "Enter a valid email";
    if (password.length < 6) e.password = "Min 6 characters";
    if (!age || Number(age) < 1) e.age = "Enter a valid age";
    if (!height || Number(height) < 50) e.height = "Enter height in cm";
    if (!weight || Number(weight) < 10) e.weight = "Enter weight in kg";
    if (!bloodGroup || bloodGroup === "Select blood group") e.bloodGroup = "Select a blood group";
    if (!gender || gender === "Select gender") e.gender = "Select a gender";
    return e;
  };

  const validateLogin = () => {
    const e: Record<string, string> = {};
    if (!email.includes("@")) e.email = "Enter a valid email";
    if (!password) e.password = "Enter your password";
    return e;
  };

  /* ── Submit — calls real backend ── */
  const handleSubmit = async () => {
    const errs = mode === "signup" ? validateSignup() : validateLogin();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await authApi.register({
          name, email, password, role: "patient",
          age, height, weight, bloodGroup, gender,
          conditions, medications, allergies,
        });
        // Persist token + user profile
        localStorage.setItem("mediflow_token", res.token);
        localStorage.setItem("mediflow_user", JSON.stringify({
          ...res.user,
          age, height, weight, bloodGroup, gender,
          conditions, medications, allergies,
        }));
        router.push("/demo/patient/dashboard");
      } else {
        const res = await authApi.login({ email, password });
        localStorage.setItem("mediflow_token", res.token);
        localStorage.setItem("mediflow_user", JSON.stringify(res.user));
        router.push("/demo/patient/dashboard");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  const sel = (err?: string) =>
    `w-full bg-bgLight/60 border rounded-xl px-4 py-3 text-primary text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent transition font-medium ${err ? "border-danger" : "border-bgSoft"}`;

  return (
    <>
      <PageContainer maxWidth="sm">
        <Card padding="lg" className="mt-8 animate-fadeUp mb-10">

          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <UserCircle className="text-white" size={32} />
          </div>
          <h2 className="font-display text-2xl text-primary font-bold text-center mt-4">MediFlow AI</h2>
          <p className="text-secondary text-sm text-center mt-1 px-4">Your personal AI health companion</p>

          {/* Tab toggle */}
          <div className="bg-bgLight rounded-xl p-1 flex mt-6">
            {(["login", "signup"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setErrors({}); }}
                className={`flex-1 py-2 rounded-lg text-sm transition-all duration-200 ${mode === m ? "bg-white shadow-sm text-primary font-semibold" : "text-primary/50 hover:text-primary"}`}>
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {errors.form && (
            <div className="mt-4 bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-danger text-sm font-medium">{errors.form}</div>
          )}

          <div className="mt-5 space-y-4">
            {/* ── SIGN-UP ONLY FIELDS ── */}
            {mode === "signup" && (
              <InputField label="Full Name" placeholder="e.g. Arjun Sharma" value={name} required
                onChange={e => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: "" })); }}
                error={errors.name} leftIcon={<User size={16} />} />
            )}

            {/* Email */}
            <InputField label="Email Address" type="email" placeholder="arjun@example.com" value={email} required
              onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: "" })); }}
              error={errors.email} leftIcon={<Mail size={16} />} />

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-primary mb-1.5 flex items-center">
                <Lock size={16} className="mr-1.5 text-secondary" />Password <span className="text-danger ml-1">*</span>
              </label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password}
                  onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: "" })); }}
                  placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
                  className={`w-full bg-bgLight/60 border rounded-xl px-4 py-3 pr-11 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent transition ${errors.password ? "border-danger" : "border-bgSoft"}`} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-danger text-xs mt-1.5">{errors.password}</p>}
              {mode === "signup" && !errors.password && <p className="text-primary/50 text-xs mt-1.5">Minimum 6 characters</p>}
            </div>

            {/* ── SIGN-UP EXTENDED FIELDS ── */}
            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Age" type="number" placeholder="28" value={age} required
                    onChange={e => { setAge(e.target.value); if (errors.age) setErrors(p => ({ ...p, age: "" })); }}
                    error={errors.age} />
                  <InputField label="Height (cm)" type="number" placeholder="170" value={height} required
                    onChange={e => { setHeight(e.target.value); if (errors.height) setErrors(p => ({ ...p, height: "" })); }}
                    error={errors.height} leftIcon={<Ruler size={16} />} />
                </div>

                <InputField label="Weight (kg)" type="number" placeholder="65" value={weight} required
                  onChange={e => { setWeight(e.target.value); if (errors.weight) setErrors(p => ({ ...p, weight: "" })); }}
                  error={errors.weight} leftIcon={<Weight size={16} />} />

                {/* Blood Group */}
                <div>
                  <label className="text-sm font-semibold text-primary mb-1.5 flex items-center">
                    <Droplets size={16} className="mr-1.5 text-secondary" />Blood Group <span className="text-danger ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select value={bloodGroup}
                      onChange={e => { setBloodGroup(e.target.value); if (errors.bloodGroup) setErrors(p => ({ ...p, bloodGroup: "" })); }}
                      className={sel(errors.bloodGroup)}>
                      {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                  </div>
                  {errors.bloodGroup && <p className="text-danger text-xs mt-1.5">{errors.bloodGroup}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="text-sm font-semibold text-primary mb-1.5 flex items-center">
                    <Users size={16} className="mr-1.5 text-secondary" />Gender <span className="text-danger ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select value={gender}
                      onChange={e => { setGender(e.target.value); if (errors.gender) setErrors(p => ({ ...p, gender: "" })); }}
                      className={sel(errors.gender)}>
                      {GENDERS.map(g => <option key={g}>{g}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
                  </div>
                  {errors.gender && <p className="text-danger text-xs mt-1.5">{errors.gender}</p>}
                </div>

                {/* Pre-existing Conditions */}
                <div>
                  <label className="text-sm font-semibold text-primary mb-2 block">Pre-existing Conditions</label>
                  <div className="flex flex-wrap gap-2">
                    {CONDITIONS.map(c => (
                      <button key={c} type="button" onClick={() => toggleCondition(c)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${conditions.includes(c) ? "bg-secondary text-white border-secondary" : "bg-bgSoft border-bgLight text-primary/70 hover:border-secondary"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <InputField label="Current Medications" placeholder="e.g. Metformin 500mg, Lisinopril" value={medications}
                  onChange={e => setMedications(e.target.value)} hint="Optional" />

                <InputField label="Known Allergies" placeholder="e.g. Penicillin, peanuts" value={allergies}
                  onChange={e => setAllergies(e.target.value)} hint="Optional" />
              </>
            )}

            {/* Login helper */}
            {mode === "login" && (
              <p className="text-sm text-primary/60 text-center">
                First time here?{" "}
                <button onClick={() => { setMode("signup"); setErrors({}); }} className="text-accent font-semibold hover:underline">Create account</button>
              </p>
            )}
          </div>

          <div className="mt-4 bg-bgSoft rounded-xl p-3 flex gap-2 items-start">
            <ShieldCheck className="text-success shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-primary/60 leading-relaxed">
              Your data is securely handled by the MediFlow backend server.
            </p>
          </div>

          <Button variant="primary" size="lg" className="w-full mt-5" onClick={handleSubmit} loading={loading}>
            {mode === "login" ? "Log In →" : "Create Account & Start →"}
          </Button>
        </Card>
      </PageContainer>
    </>
  );
}
