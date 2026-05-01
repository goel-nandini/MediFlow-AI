"use client";

import React from "react";
import { Stethoscope, Lock } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DemoNavbar } from "@/components/layout/DemoNavbar";
import { useRouter } from "next/navigation";

export default function DoctorPlaceholderPage() {
  const router = useRouter();

  return (
    <>
      <DemoNavbar showBack backHref="/demo" title="Doctor Dashboard" />
      <PageContainer maxWidth="md" className="flex flex-col items-center justify-center py-20 min-h-[80vh] animate-fadeUp">
        
        <div className="w-24 h-24 bg-bgLight rounded-full flex items-center justify-center mb-8 shadow-sm">
          <Stethoscope className="text-secondary" size={48} />
        </div>
        
        <h2 className="font-display text-3xl text-primary font-bold text-center">
          Doctor Dashboard
        </h2>
        <p className="text-secondary text-base mt-2 text-center max-w-sm">
          Coming soon — currently in development
        </p>

        <Card padding="lg" className="w-full mt-10 max-w-lg mx-auto bg-white/80">
          <h3 className="font-semibold text-primary text-sm uppercase tracking-widest mb-6">
            Upcoming Features
          </h3>
          
          <div className="space-y-4">
            {[
              "Live Patient Queue & Triage Board",
              "AI Clinical Summaries & Risk Overrides",
              "Hospital Capacity & Analytics Dashboard"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 bg-bgLight/30 p-4 rounded-xl border border-bgSoft/50">
                <div className="bg-primary/5 p-2 rounded-lg text-primary/40">
                  <Lock size={18} />
                </div>
                <span className="text-sm font-medium text-primary/80">{feature}</span>
              </div>
            ))}
          </div>
        </Card>

        <Button 
          variant="ghost" 
          className="mt-10"
          onClick={() => router.push("/demo")}
        >
          ← Back to Role Selection
        </Button>
      </PageContainer>
    </>
  );
}
