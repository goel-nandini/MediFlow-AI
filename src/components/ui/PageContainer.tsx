import React, { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = "xl",
  className = "",
}) => {
  const maxWidths = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-bgLight via-white to-bgSoft ${className}`}>
      <div className={`${maxWidths[maxWidth]} mx-auto px-4 py-8`}>
        {children}
      </div>
    </div>
  );
};
