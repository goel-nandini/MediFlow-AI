import React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", leftIcon, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-sans font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
      primary: "bg-primary text-white hover:opacity-90 focus:ring-primary shadow-sm",
      secondary: "bg-secondary text-white hover:opacity-90 focus:ring-secondary shadow-sm",
      danger: "bg-danger text-white hover:opacity-90 focus:ring-danger shadow-sm",
      ghost: "border border-primary text-primary bg-transparent hover:bg-primary/5 focus:ring-primary",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
