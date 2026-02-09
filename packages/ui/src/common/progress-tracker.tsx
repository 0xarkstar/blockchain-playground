"use client";

interface Step {
  label: string;
  description?: string;
}

interface ProgressTrackerProps {
  steps: Step[];
  activeStep: number;
  onStepClick?: (step: number) => void;
}

export function ProgressTracker({
  steps,
  activeStep,
  onStepClick,
}: ProgressTrackerProps) {
  return (
    <div className="flex items-start gap-2">
      {steps.map((step, index) => {
        const isCompleted = index < activeStep;
        const isActive = index === activeStep;
        return (
          <div key={step.label} className="flex items-center gap-2">
            <button
              onClick={() => onStepClick?.(index)}
              disabled={!onStepClick}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                isCompleted
                  ? "bg-primary text-primary-foreground"
                  : isActive
                    ? "bg-primary text-primary-foreground ring-2 ring-ring ring-offset-2 ring-offset-background"
                    : "bg-muted text-muted-foreground"
              } ${onStepClick ? "cursor-pointer" : "cursor-default"}`}
            >
              {isCompleted ? "\u2713" : index + 1}
            </button>
            <div className="flex flex-col">
              <span className={`text-xs font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
              {step.description && (
                <span className="text-xs text-muted-foreground">{step.description}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`h-0.5 w-8 ${isCompleted ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
