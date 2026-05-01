"use client";

import React from "react";
import { ChevronLeft, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMediFlowStore } from "@/store/useMediFlowStore";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface DemoNavbarProps {
  showBack?: boolean;
  backHref?: string;
  title: string;
  step?: number;
  totalSteps?: number;
}

export const DemoNavbar: React.FC<DemoNavbarProps> = ({
  showBack = false,
  backHref,
  title,
  step,
  totalSteps,
}) => {
  const router = useRouter();
  const sessionId = useMediFlowStore((state) => state.sessionId);

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-bgSoft flex flex-col w-full">
      <div className="h-14 px-4 flex items-center justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center flex-1">
          {showBack && (
            <button
              onClick={handleBack}
              className="mr-3 p-1.5 rounded-lg text-primary hover:bg-bgLight transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Activity className="text-accent" size={24} />
            <span className="font-display font-bold text-primary text-lg hidden sm:block">
              MediFlow AI
            </span>
            <span className="text-primary/30 mx-1 hidden sm:block">/</span>
            <span className="font-semibold text-primary text-sm sm:text-base truncate">
              {title}
            </span>
          </div>
        </div>

        <div className="flex items-center">
          <div className="bg-bgLight px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            <span className="text-primary/50 text-xs font-mono font-medium">
              ID: {sessionId.substring(0, 6)}
            </span>
          </div>
        </div>
      </div>
      
      {step && totalSteps && (
        <ProgressBar current={step} total={totalSteps} className="w-full absolute bottom-0 translate-y-[1px]" />
      )}
    </div>
  );
};
