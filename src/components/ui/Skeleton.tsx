import React from "react";

interface SkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  lines = 1,
  avatar = false,
}) => {
  return (
    <div className={`w-full flex ${avatar ? "gap-4 items-center" : "flex-col"} ${className}`}>
      {avatar && (
        <div className="w-12 h-12 rounded-full shimmer-bg animate-shimmer shrink-0" />
      )}
      <div className="flex-1 flex flex-col gap-2 w-full">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 rounded-md shimmer-bg animate-shimmer ${
              i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
