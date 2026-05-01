import React from "react";

interface ProgressBarProps {
  current: number;
  total: number;
  labels?: string[];
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  labels,
  className = "",
}) => {
  const percentage = Math.min(Math.max((current / total) * 100, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="relative h-1.5 bg-bgSoft rounded-full w-full">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
        {Array.from({ length: total }).map((_, i) => {
          const stepPercent = ((i + 1) / total) * 100;
          const isCompleted = current >= i + 1;
          return (
            <div
              key={i}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border-2 ${
                isCompleted ? "bg-accent border-accent" : "bg-white border-bgSoft"
              }`}
              style={{ left: `${stepPercent}%` }}
            />
          );
        })}
      </div>
      {labels && labels[current - 1] && (
        <p className="mt-2 text-center text-accent text-xs font-semibold">
          {labels[current - 1]}
        </p>
      )}
    </div>
  );
};
