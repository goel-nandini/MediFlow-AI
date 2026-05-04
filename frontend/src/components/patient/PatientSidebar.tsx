"use client";

import React from "react";
import { LayoutDashboard, HeartPulse, BarChart2, Lightbulb, Bot, Calendar, History, LogOut, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export type PatientTab = "overview" | "health-summary" | "analytics" | "recommendations" | "my-doctors";

interface NavItem {
  id: PatientTab | "chat" | "appointments" | "health-history";
  label: string;
  icon: React.ReactNode;
  route?: string;
  scrollTo?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Dashboard", icon: <LayoutDashboard size={18} />, route: "/demo/patient/dashboard" },
  { id: "chat", label: "AI Assistant", icon: <Bot size={18} />, route: "/demo/patient/ai-assistant" },
  { id: "appointments", label: "Appointments", icon: <Calendar size={18} />, route: "/demo/patient/appointments" },
  { id: "my-doctors", label: "My Care Team", icon: <HeartPulse size={18} />, route: "/demo/patient/my-doctors" },
  { id: "health-history", label: "Health History", icon: <History size={18} />, route: "/demo/patient/history" },
  // { id: "health-summary",   label: "Health Summary",  icon: <HeartPulse size={18} />,         route: "/demo/patient/dashboard#ai-analysis-section" },
  // { id: "analytics",        label: "Analytics",       icon: <BarChart2 size={18} /> },
  // { id: "recommendations",  label: "Recommendations", icon: <Lightbulb size={18} />,          route: "/demo/patient/dashboard#ai-analysis-section" },
];

interface PatientSidebarProps {
  activeTab: PatientTab;
  onTabChange: (tab: PatientTab) => void;
  patientName: string;
  riskLabel: string;
  riskColor: string;
}

export function PatientSidebar({ activeTab, onTabChange, patientName, riskLabel, riskColor }: PatientSidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    try {
      localStorage.removeItem("mediflow_token");
      localStorage.removeItem("mediflow_user");
      localStorage.removeItem("mediflow_appointments");
      localStorage.removeItem("mediflow_recommended_doctors");
    } catch { }
    router.push("/demo/patient/auth");
  };

  const handleNav = (item: NavItem) => {
    if (item.route) {
      router.push(item.route);
      if (item.route.includes("#")) {
        const id = item.route.split("#")[1];
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    } else if (item.scrollTo) {
      setTimeout(() => {
        document.getElementById(item.scrollTo!)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else if (item.id === "analytics") {
      alert("Analytics coming soon!");
    }
  };

  return (
    <aside className="w-full md:w-64 shrink-0 bg-white border-r border-bgSoft flex flex-col md:h-screen sticky top-0 z-10">

      {/* MediFlow AI Brand Logo */}
      <div className="px-6 py-5 border-b border-bgSoft">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1B4965] flex items-center justify-center shrink-0">
            <Activity size={16} color="white" />
          </div>
          <div>
            <h1 className="font-bold text-[#0F172A] text-[16px] leading-tight">MediFlow AI</h1>
            <p className="text-[#64748B] text-[11px]">Patient Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = !item.route && !item.scrollTo && activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left group",
                isActive
                  ? "bg-primary text-white shadow-md"
                  : "text-primary/70 hover:bg-primary/5 hover:text-primary"
              )}
            >
              <span className={cn("transition-colors duration-200", isActive ? "text-white" : "text-primary/50 group-hover:text-primary")}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom: User Profile + Logout */}
      <div className="px-4 py-4 border-t border-bgSoft">
        {/* User profile card */}
        <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl px-3 py-3 mb-3 border border-bgSoft">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-base shrink-0 uppercase">
            {patientName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[#0F172A] text-sm truncate">{patientName}</p>
            <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-block mt-0.5", riskColor)}>
              {riskLabel}
            </span>
          </div>
        </div>

        {/* Log Out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut size={17} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
