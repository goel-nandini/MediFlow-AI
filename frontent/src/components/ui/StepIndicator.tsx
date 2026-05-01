import React from "react";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  className = "",
}) => {
  return (
    <div className={`flex items-center w-full justify-between relative ${className}`}>
      <div className="absolute left-0 top-4 w-full h-0.5 bg-bgSoft -z-10" />
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div key={step} className="flex flex-col items-center gap-2 bg-transparent z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                ${isCompleted ? "bg-primary text-white" : ""}
                ${isCurrent ? "bg-accent text-white ring-4 ring-accent/30 animate-pulse" : ""}
                ${!isCompleted && !isCurrent ? "bg-bgSoft text-primary/40" : ""}
              `}
            >
              {isCompleted ? <Check size={16} /> : stepNumber}
            </div>
            <span
              className={`text-xs font-semibold ${
                isCurrent ? "text-primary" : "text-primary/50"
              }`}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
};
