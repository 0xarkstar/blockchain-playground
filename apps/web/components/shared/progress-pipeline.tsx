"use client";

import { useState, useEffect, useRef } from "react";
import { Check, X, CircleDot, Circle } from "lucide-react";

interface PipelineStep {
  id: string;
  label: string;
  description?: string;
}

type StepStatus = "pending" | "active" | "complete" | "error";

interface ProgressPipelineProps {
  steps: PipelineStep[];
  currentStepIndex: number;
  stepStatuses?: Record<string, StepStatus>;
  showElapsedTime?: boolean;
}

function getStatus(
  step: PipelineStep,
  index: number,
  currentStepIndex: number,
  stepStatuses?: Record<string, StepStatus>,
): StepStatus {
  if (stepStatuses?.[step.id]) {
    return stepStatuses[step.id];
  }
  if (index < currentStepIndex) return "complete";
  if (index === currentStepIndex) return "active";
  return "pending";
}

const statusConfig: Record<
  StepStatus,
  { colorClass: string; bgClass: string; Icon: typeof Check }
> = {
  complete: { colorClass: "text-green-600 dark:text-green-400", bgClass: "bg-green-100 dark:bg-green-900", Icon: Check },
  active: { colorClass: "text-blue-600 dark:text-blue-400", bgClass: "bg-blue-600 dark:bg-blue-500", Icon: CircleDot },
  error: { colorClass: "text-red-600 dark:text-red-400", bgClass: "bg-red-100 dark:bg-red-900", Icon: X },
  pending: { colorClass: "text-muted-foreground", bgClass: "bg-muted", Icon: Circle },
};

function ElapsedTimer() {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    startRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-xs text-muted-foreground">{elapsed}s</span>
  );
}

export function ProgressPipeline({
  steps,
  currentStepIndex,
  stepStatuses,
  showElapsedTime = false,
}: ProgressPipelineProps) {
  return (
    <div className="flex items-start gap-0 overflow-auto flex-nowrap">
      {steps.map((step, index) => {
        const status = getStatus(step, index, currentStepIndex, stepStatuses);
        const config = statusConfig[status];
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center flex-1" style={{ minWidth: 0 }}>
            <div className="flex flex-col items-center gap-1" style={{ minWidth: 80 }}>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  status === "active"
                    ? `${config.bgClass} text-white animate-pulse`
                    : `${config.bgClass} ${config.colorClass}`
                }`}
              >
                <config.Icon className="h-4 w-4" />
              </div>
              <span className={`text-xs text-center ${status === "active" ? "font-semibold" : ""}`}>
                {step.label}
              </span>
              {step.description && (
                <span className="text-xs text-muted-foreground text-center">
                  {step.description}
                </span>
              )}
              {showElapsedTime && status === "active" && <ElapsedTimer />}
            </div>
            {!isLast && (
              <div
                className={`h-0.5 flex-1 ${
                  status === "complete"
                    ? "bg-green-500"
                    : "bg-border"
                }`}
                style={{ minWidth: 20 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
