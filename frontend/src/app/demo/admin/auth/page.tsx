"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail } from "lucide-react";
import { PageContainer } from "../../../../components/ui/PageContainer";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { InputField } from "../../../../components/ui/InputField";
import { useMediFlowStore } from "../../../../store/useMediFlowStore";
import { authApi } from "../../../../lib/api";

export default function AdminAuthPage() {
  const router = useRouter();
  const setRole = useMediFlowStore((state) => state.setRole);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("mediflow_admin_token");
      if (token) router.replace("/demo/admin");
    } catch { }
  }, [router]);

  const handleSubmit = async () => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    if (!email.trim() || !email.includes("@")) {
      newErrors.email = "Please enter a valid admin email address";
      isValid = false;
    }

    if (password.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;

    setLoading(true);

    try {
      const res = await authApi.login({ email, password, platform: 'admin' });

      if (res.user.role !== 'admin') {
         throw new Error("Access denied. Admin privileges required.");
      }

      localStorage.setItem("mediflow_admin_token", res.token);
      localStorage.setItem("mediflow_admin_user", JSON.stringify(res.user));
      setRole("admin");
      router.push("/demo/admin");
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
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="text-white" size={32} />
          </div>

          <h2 className="font-display text-2xl text-primary font-bold text-center mt-4">
            Hospital Admin Portal
          </h2>
          <p className="text-secondary text-sm text-center mt-1 leading-relaxed px-4">
            Authorized personnel only. Please sign in to manage hospital operations.
          </p>

          {errors.form && (
            <div className="mt-6 bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-danger text-sm font-medium">
              {errors.form}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <InputField
              label="Admin Email"
              type="email"
              placeholder="admin@hospital.com"
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

          <Button
            variant="primary"
            size="lg"
            className="w-full mt-8 bg-accent hover:bg-accent/90 border-none"
            onClick={handleSubmit}
            loading={loading}
          >
            Access Admin Dashboard →
          </Button>

          <div className="mt-6 text-center text-xs text-primary/40">
             To test the demo, create an admin user in the backend or use a mock account.
          </div>
        </Card>
      </PageContainer>
    </>
  );
}
