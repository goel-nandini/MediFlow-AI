import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  priority: "emergency" | "high" | "normal" | "low";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, priority, ...props }, ref) => {
    const priorityStyles = {
      emergency: "bg-red-50 text-danger border border-danger/40",
      high: "bg-amber-50 text-warning border border-warning/40",
      normal: "bg-green-50 text-success border border-success/40",
      low: "bg-blue-50 text-secondary border border-secondary/40",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
          priorityStyles[priority],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
