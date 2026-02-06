"use client";

import { Stepper } from "@mantine/core";

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
    <Stepper active={activeStep} onStepClick={onStepClick}>
      {steps.map((step, index) => (
        <Stepper.Step
          key={index}
          label={step.label}
          description={step.description}
        />
      ))}
    </Stepper>
  );
}
