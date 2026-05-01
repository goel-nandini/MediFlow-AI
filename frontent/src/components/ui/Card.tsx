import React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, subtitle, footer, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("bg-white rounded-xl shadow-sm border border-bgSoft overflow-hidden", className)}
        {...props}
      >
        {(title || subtitle) && (
          <div className="p-6 pb-0">
            {title && <h3 className="font-display text-primary text-xl font-semibold">{title}</h3>}
            {subtitle && <p className="text-secondary text-sm mt-1">{subtitle}</p>}
          </div>
        )}
        <div className={cn("p-6")}>{children}</div>
        {footer && <div className="p-6 bg-white border-t border-bgSoft pt-4">{footer}</div>}
      </div>
    );
  }
);
Card.displayName = "Card";
