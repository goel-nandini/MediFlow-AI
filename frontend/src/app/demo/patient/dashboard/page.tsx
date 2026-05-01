"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, CalendarDays, Droplet, Ruler, Weight, Phone, Mail, MapPin } from "lucide-react";
import { PatientSidebar } from "../../../../components/patient/PatientSidebar";
import HealthChat from "../../../../components/patient/HealthChat";
import { authApi } from "../../../../lib/api";
import { HealthAnalyticsSection } from "../../../../components/patient/HealthAnalyticsSection";

interface UserProfile {
  id?: string;
  name: string;
  email: string;
  age?: string;
  gender?: string;
  bloodGroup?: string;
  height?: string;
  weight?: string;
  phone?: string;
  address?: string;
  conditions?: string[];
  medications?: string;
  allergies?: string;
}

export default function PatientDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("mediflow_token") : null;
    if (!token) { router.replace("/demo/patient/auth"); return; }

    authApi.me()
      .then(res => {
        const merged = {
          ...(typeof window !== "undefined" ? JSON.parse(localStorage.getItem("mediflow_user") || "{}") : {}),
          ...res.user,
        };
        setUser(merged);
        if (typeof window !== "undefined") localStorage.setItem("mediflow_user", JSON.stringify(merged));
      })
      .catch(() => {
        try {
          const cached = localStorage.getItem("mediflow_user");
          if (cached) setUser(JSON.parse(cached));
          else router.replace("/demo/patient/auth");
        } catch { router.replace("/demo/patient/auth"); }
      });
  }, [router]);

  if (!user) return null;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8FAFC' }}>
      <PatientSidebar
        activeTab="overview"
        onTabChange={() => {}}
        patientName={user.name}
        riskLabel="Active"
        riskColor="bg-green-100 text-green-700 border-green-200"
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Page Header */}
        <div style={{ padding: '20px 32px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#64748B', fontSize: '13px', fontWeight: 500, margin: 0 }}>Patient Portal</p>
            <h2 style={{ color: '#0F172A', fontSize: '22px', fontWeight: 700, margin: '2px 0 0 0' }}>Dashboard</h2>
          </div>
          <span style={{ color: '#94A3B8', fontSize: '13px' }}>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {/* Two-column layout */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 420px', overflow: 'hidden' }}>

          {/* LEFT: Profile & Medical Info — scrollable */}
          <div style={{ overflowY: 'auto', padding: '28px 32px', borderRight: '1px solid #E2E8F0' }}>

            {/* Vitals Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { icon: <Droplet size={22} />, bg: '#EFF6FF', color: '#2563EB', label: 'BLOOD GROUP', value: user.bloodGroup || 'O+', unit: '' },
                { icon: <CalendarDays size={22} />, bg: '#EEF2FF', color: '#4F46E5', label: 'AGE / GENDER', value: `${user.age || '28'} ${user.gender === 'M' ? 'M' : user.gender === 'F' ? 'F' : 'U'}`, unit: '' },
                { icon: <Ruler size={22} />, bg: '#ECFDF5', color: '#059669', label: 'HEIGHT', value: user.height || '175', unit: 'cm' },
                { icon: <Weight size={22} />, bg: '#FFF7ED', color: '#EA580C', label: 'WEIGHT', value: user.weight || '70', unit: 'kg' },
              ].map((v, i) => (
                <div key={i} style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: v.bg, color: v.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {v.icon}
                  </div>
                  <div>
                    <p style={{ color: '#64748B', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', margin: '0 0 2px 0' }}>{v.label}</p>
                    <p style={{ color: '#0F172A', fontSize: '18px', fontWeight: 800, margin: 0 }}>
                      {v.value} {v.unit && <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>{v.unit}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Personal + Medical side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Personal Info */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h3 style={{ color: '#0F172A', fontSize: '15px', fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={17} color="#1B4965" /> Personal Information
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { icon: <Mail size={17} />, label: 'EMAIL ADDRESS', value: user.email },
                    { icon: <Phone size={17} />, label: 'PHONE NUMBER', value: user.phone || '+1 (555) 000-0000' },
                    { icon: <MapPin size={17} />, label: 'ADDRESS', value: user.address || '123 Medical Drive, Health City, NY 10001' },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#94A3B8', marginTop: '2px', flexShrink: 0 }}>{row.icon}</span>
                      <div>
                        <p style={{ color: '#64748B', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', margin: '0 0 2px 0' }}>{row.label}</p>
                        <p style={{ color: '#0F172A', fontSize: '14px', fontWeight: 500, margin: 0 }}>{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical History */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h3 style={{ color: '#0F172A', fontSize: '15px', fontWeight: 700, margin: '0 0 20px 0' }}>Medical History</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <p style={{ color: '#64748B', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', margin: '0 0 8px 0' }}>CHRONIC CONDITIONS</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {user.conditions && user.conditions.length > 0
                        ? user.conditions.map(c => <span key={c} style={{ background: '#FFF1F2', color: '#BE123C', border: '1px solid #FECDD3', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{c}</span>)
                        : <span style={{ color: '#64748B', fontSize: '13px' }}>None recorded</span>}
                    </div>
                  </div>
                  <div>
                    <p style={{ color: '#64748B', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', margin: '0 0 6px 0' }}>CURRENT MEDICATIONS</p>
                    <p style={{ color: '#0F172A', fontSize: '13px', fontWeight: 500, background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', margin: 0 }}>{user.medications || 'None'}</p>
                  </div>
                  <div>
                    <p style={{ color: '#64748B', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', margin: '0 0 6px 0' }}>KNOWN ALLERGIES</p>
                    <p style={{ color: '#0F172A', fontSize: '13px', fontWeight: 500, background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', margin: 0 }}>{user.allergies || 'None'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Analytics */}
            <HealthAnalyticsSection />

          </div>

          {/* RIGHT: Floating AI Chat Widget */}
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px 20px 16px 12px' }}>
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: '20px',
              border: '1.5px solid #D1D5DB',
              boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(27,73,101,0.08)',
              background: '#FFFFFF',
            }}>
              <HealthChat />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
