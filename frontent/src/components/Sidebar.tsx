"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Triage", href: "/triage", icon: AlertTriangle },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="bg-primary text-white h-full w-64 flex flex-col p-4" aria-label="Sidebar navigation">
      {/* Logo */}
      <div className="mb-8 px-3 pt-2">
        <span className="font-display text-sm font-semibold text-white/80 tracking-wide uppercase">
          MediFlow AI
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1" aria-label="Sidebar links">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "text-white bg-white/15 border-l-2 border-accent"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User profile at bottom */}
      <div className="border-t border-white/10 pt-4 mt-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            SA
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-medium truncate">Dr. Sarah Ahmed</p>
            <p className="text-white/50 text-xs truncate">Cardiologist</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
