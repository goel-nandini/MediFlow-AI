"use client";

import React from "react";
import { LayoutDashboard, HeartPulse, BarChart2, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export type PatientTab = "overview" | "health-summary" | "analytics" | "recommendations";

interface NavItem {
  id: PatientTab;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview",         label: "Overview",        icon: <LayoutDashboard size={18} /> },
  { id: "health-summary",   label: "Health Summary",  icon: <HeartPulse size={18} />      },
  { id: "analytics",        label: "Analytics",       icon: <BarChart2 size={18} />        },
  { id: "recommendations",  label: "Recommendations", icon: <Lightbulb size={18} />        },
];

interface PatientSidebarProps {
  activeTab: PatientTab;
  onTabChange: (tab: PatientTab) => void;
  patientName: string;
  riskLabel: string;
  riskColor: string;
}

export function PatientSidebar({
  activeTab,
  onTabChange,
  patientName,
  riskLabel,
  riskColor,
}: PatientSidebarProps) {
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-bgSoft flex flex-col min-h-screen sticky top-0">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-bgSoft">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <HeartPulse size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-primary text-sm">MediFlow AI</span>
        </div>
      </div>

      {/* Patient Avatar */}
      <div className="px-6 py-5 border-b border-bgSoft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold font-display text-base shrink-0 uppercase">
            {patientName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-primary text-sm truncate">{patientName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                  riskColor
                )}
              >
                {riskLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left group",
                isActive
                  ? "bg-secondary/10 text-secondary font-semibold"
                  : "text-primary/60 hover:bg-bgLight hover:text-primary"
              )}
            >
              <span
                className={cn(
                  "transition-colors duration-200",
                  isActive ? "text-secondary" : "text-primary/40 group-hover:text-primary/70"
                )}
              >
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-bgSoft">
        <p className="text-[10px] text-primary/30 font-medium uppercase tracking-wider text-center">
          Demo Session · MediFlow AI
        </p>
      </div>
    </aside>
  );
}
