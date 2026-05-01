import React from "react";
import {
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Sidebar } from "../../components/Sidebar";
import { Card } from "../../components/ui/Card";
import { TriageCard } from "../../components/TriageCard";
import { cn } from "../../lib/utils";
import Link from "next/link";

// Summary card data
const summaryCards = [
  {
    label: "Total Patients",
    value: "124",
    icon: Users,
    borderColor: "border-primary",
    iconColor: "text-primary",
  },
  {
    label: "Emergency",
    value: "8",
    icon: AlertTriangle,
    borderColor: "border-danger",
    iconColor: "text-danger",
  },
  {
    label: "Pending Triage",
    value: "23",
    icon: Clock,
    borderColor: "border-warning",
    iconColor: "text-warning",
  },
  {
    label: "Resolved Today",
    value: "93",
    icon: CheckCircle,
    borderColor: "border-success",
    iconColor: "text-success",
  },
];

// Mock triage queue
const triageQueue = [
  {
    name: "Ayesha Khan",
    age: 34,
    condition: "Chest Pain",
    priority: "emergency" as const,
    waitTime: "8 min",
    assignedDoctor: "Dr. Ahmed",
  },
  {
    name: "Rohan Mehta",
    age: 56,
    condition: "Suspected Fracture",
    priority: "high" as const,
    waitTime: "15 min",
    assignedDoctor: "Dr. Patel",
  },
  {
    name: "Sara Ali",
    age: 28,
    condition: "High Fever",
    priority: "normal" as const,
    waitTime: "22 min",
    assignedDoctor: "Dr. Nair",
  },
  {
    name: "Vikram Das",
    age: 45,
    condition: "Migraine",
    priority: "low" as const,
    waitTime: "35 min",
    assignedDoctor: "Dr. Ahmed",
  },
  {
    name: "Priya Sharma",
    age: 67,
    condition: "Shortness of Breath",
    priority: "emergency" as const,
    waitTime: "5 min",
    assignedDoctor: "Dr. Kapoor",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:block flex-shrink-0 w-64 overflow-y-auto">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-bgLight p-6">
        {/* Header */}
        <header className="mb-8">
          <h1 className="font-display text-2xl font-bold text-primary">
            Good morning, Dr. Ahmed 👋
          </h1>
          <p className="text-secondary text-sm mt-1">
            Here&apos;s today&apos;s triage overview
          </p>
        </header>

        {/* Summary cards */}
        <section
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          aria-label="Summary statistics"
        >
          {summaryCards.map(({ label, value, icon: Icon, borderColor, iconColor }) => (
            <Card
              key={label}
              className={cn("border-t-4", borderColor)}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={cn("w-5 h-5", iconColor)} aria-hidden="true" />
              </div>
              <p className={cn("font-display text-2xl font-bold text-primary")}>{value}</p>
              <p className="text-sm text-secondary mt-1">{label}</p>
            </Card>
          ))}
        </section>

        {/* Triage queue */}
        <section aria-label="Active triage queue">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-primary">
              Active Triage Queue
            </h2>
            <Link
              href="/triage"
              className="text-secondary text-sm hover:underline hover:text-primary transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {triageQueue.map((patient) => (
              <TriageCard key={patient.name} {...patient} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
