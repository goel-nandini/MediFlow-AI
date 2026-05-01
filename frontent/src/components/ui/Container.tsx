import React from "react";
import { cn } from "../../lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> { }

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Container.displayName = "Container";
