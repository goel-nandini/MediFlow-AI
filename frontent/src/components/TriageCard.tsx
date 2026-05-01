import React from "react";
import { Clock } from "lucide-react";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";

export interface TriageCardProps {
  name: string;
  age: number;
  condition: string;
  priority: "emergency" | "high" | "normal" | "low";
  waitTime: string;
  assignedDoctor: string;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const TriageCard = ({
  name,
  age,
  condition,
  priority,
  waitTime,
  assignedDoctor,
  className,
}: TriageCardProps) => {
  return (
    <article
      className={cn(
        "bg-white rounded-xl border border-bgSoft p-4 flex items-center gap-4 hover:shadow-md transition-shadow",
        className
      )}
    >
      {/* Avatar */}
      <div
        aria-hidden="true"
        className="w-10 h-10 rounded-full bg-bgLight text-primary font-bold flex items-center justify-center flex-shrink-0 text-sm"
      >
        {getInitials(name)}
      </div>

      {/* Center info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-primary truncate">{name}</p>
        <p className="text-sm text-secondary truncate">{condition}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
          <span>Age {age}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {waitTime} wait
          </span>
          <span className="hidden sm:inline truncate">Assigned: {assignedDoctor}</span>
        </div>
      </div>

      {/* Right: badge + actions */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <Badge priority={priority}>{priority}</Badge>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" aria-label={`View details for ${name}`}>
            View
          </Button>
          <Button variant="primary" size="sm" aria-label={`Assign doctor to ${name}`}>
            Assign
          </Button>
        </div>
      </div>
    </article>
  );
};
