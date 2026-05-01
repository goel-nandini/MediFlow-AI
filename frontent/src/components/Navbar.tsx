"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Activity, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const navLinks = [
  { label: "Home",         href: "#hero" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features",     href: "#features" },
  { label: "Contact",      href: "/demo" },
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  if (pathname.startsWith("/demo")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50">
      {/* Main bar */}
      <div
        className="h-16 flex items-center px-6 lg:px-12 justify-between
          bg-white/80 backdrop-blur-md border-b border-bgSoft shadow-sm
          dark:bg-primary/90 dark:border-white/10"
      >
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-2 shrink-0">
          <Activity className="w-5 h-5 text-accent" />
          <span className="font-display font-bold text-xl text-primary dark:text-white">
            MediFlow AI
          </span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map(({ label, href }, i) => (
            <a
              key={label}
              href={href}
              className={
                i === 0
                  ? "text-sm font-semibold text-accent"
                  : "text-sm font-medium text-primary/70 hover:text-primary dark:text-white/70 dark:hover:text-white transition-colors"
              }
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">

          {/* CTA */}
          <a
            href="/demo"
            className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200
              bg-primary text-white hover:bg-secondary
              dark:bg-accent dark:text-primary dark:hover:bg-secondary"
          >
            Request Demo
          </a>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            className="lg:hidden text-primary dark:text-white transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden absolute left-0 right-0 z-40
            bg-white dark:bg-primary shadow-xl rounded-b-2xl
            border-t border-bgSoft dark:border-white/10 px-6 py-4"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="py-2.5 text-sm font-medium text-primary/80 hover:text-primary
                  dark:text-white/70 dark:hover:text-white transition-colors border-b
                  border-bgSoft/60 dark:border-white/5 last:border-0"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-4 mt-2 border-t border-bgSoft dark:border-white/10">
            <a
              href="/demo"
              onClick={() => setMobileOpen(false)}
              className="ml-auto px-4 py-2 rounded-lg text-sm font-semibold
                bg-primary text-white dark:bg-accent dark:text-primary"
            >
              Request Demo
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
