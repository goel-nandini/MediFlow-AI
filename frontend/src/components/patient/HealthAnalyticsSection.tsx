"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, Activity, BarChart2, ShieldAlert } from "lucide-react";

// ── Realistic 30-day mock data ──────────────────────────────────────────────
const generateMonthData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const riskBase = [35, 55, 45, 70, 60, 40][i];
    return {
      month: months[d.getMonth()],
      severity: riskBase + Math.floor(Math.random() * 15),
      visits: Math.floor(Math.random() * 3) + (i === 3 ? 4 : 1),
      riskScore: Math.min(100, riskBase + Math.floor(Math.random() * 20)),
    };
  });
};

const SYMPTOM_DATA = [
  { week: "W1", headache: 3, fatigue: 5, pain: 2 },
  { week: "W2", headache: 5, fatigue: 4, pain: 4 },
  { week: "W3", headache: 2, fatigue: 6, pain: 3 },
  { week: "W4", headache: 4, fatigue: 3, pain: 5 },
  { week: "W5", headache: 1, fatigue: 2, pain: 2 },
  { week: "W6", headache: 3, fatigue: 4, pain: 3 },
];

const CUSTOM_TOOLTIP_STYLE = {
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "13px",
  color: "#0F172A",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

interface TabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabProps[] = [
  { id: "severity", label: "Severity",       icon: <Activity size={14} /> },
  { id: "symptoms", label: "Symptom Trends", icon: <TrendingUp size={14} /> },
  { id: "risk",     label: "Risk Score",     icon: <ShieldAlert size={14} /> },
];

export function HealthAnalyticsSection() {
  const [activeTab, setActiveTab] = useState("severity");
  const [monthData] = useState(generateMonthData);

  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: "16px",
      border: "1px solid #E2E8F0",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <p style={{ color: "#64748B", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px", margin: 0 }}>AI-Powered</p>
            <h3 style={{ color: "#0F172A", fontSize: "16px", fontWeight: 700, margin: "2px 0 0 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <BarChart2 size={18} color="#1B4965" /> Health Analytics
            </h3>
          </div>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748B", background: "#F1F5F9", padding: "4px 10px", borderRadius: "20px" }}>
            Last 6 Months
          </span>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid #F1F5F9", marginBottom: "0" }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                fontSize: "12px",
                fontWeight: 600,
                border: "none",
                background: "none",
                cursor: "pointer",
                borderBottom: activeTab === tab.id ? "2px solid #1B4965" : "2px solid transparent",
                color: activeTab === tab.id ? "#1B4965" : "#94A3B8",
                transition: "all 0.15s",
                marginBottom: "-1px",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div style={{ padding: "20px 16px 20px 8px" }}>

        {/* Severity Chart */}
        {activeTab === "severity" && (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="severityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B4965" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1B4965" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="severity"
                stroke="#1B4965"
                strokeWidth={2.5}
                fill="url(#severityGrad)"
                dot={{ fill: "#1B4965", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#1B4965" }}
                name="Severity Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* Symptom Trends Chart */}
        {activeTab === "symptoms" && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SYMPTOM_DATA} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="headache" name="Headache"  fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fatigue"  name="Fatigue"   fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pain"     name="Body Pain" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Risk Progression Chart */}
        {activeTab === "risk" && (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthData} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, "Risk Score"]} />
              <Line
                type="monotone"
                dataKey="riskScore"
                stroke="#EF4444"
                strokeWidth={2.5}
                dot={{ fill: "#EF4444", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                name="Risk Score"
              />
              <Line
                type="monotone"
                dataKey="visits"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={{ fill: "#10B981", r: 3, strokeWidth: 0 }}
                name="Doctor Visits"
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            </LineChart>
          </ResponsiveContainer>
        )}

      </div>

      {/* Summary chips */}
      <div style={{ padding: "0 24px 20px 24px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {[
          { label: "Avg Severity", value: `${Math.round(monthData.reduce((s, d) => s + d.severity, 0) / monthData.length)}`, color: "#1B4965", bg: "#EFF6FF" },
          { label: "Peak Risk",    value: `${Math.max(...monthData.map(d => d.riskScore))}%`, color: "#EF4444", bg: "#FEF2F2" },
          { label: "Total Visits", value: `${monthData.reduce((s, d) => s + d.visits, 0)}`,   color: "#10B981", bg: "#ECFDF5" },
        ].map(chip => (
          <div key={chip.label} style={{ background: chip.bg, padding: "6px 14px", borderRadius: "20px", display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ color: chip.color, fontSize: "14px", fontWeight: 800 }}>{chip.value}</span>
            <span style={{ color: "#64748B", fontSize: "11px", fontWeight: 600 }}>{chip.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
