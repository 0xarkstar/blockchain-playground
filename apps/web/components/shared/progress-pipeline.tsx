"use client";

import { useState, useEffect, useRef } from "react";
import { Group, Stack, Text, ThemeIcon, Box } from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconCircleDot,
  IconCircle,
} from "@tabler/icons-react";

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
  { color: string; icon: typeof IconCheck }
> = {
  complete: { color: "green", icon: IconCheck },
  active: { color: "blue", icon: IconCircleDot },
  error: { color: "red", icon: IconX },
  pending: { color: "gray", icon: IconCircle },
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
    <Text size="xs" c="dimmed">
      {elapsed}s
    </Text>
  );
}

export function ProgressPipeline({
  steps,
  currentStepIndex,
  stepStatuses,
  showElapsedTime = false,
}: ProgressPipelineProps) {
  return (
    <Group gap={0} wrap="nowrap" style={{ overflow: "auto" }}>
      {steps.map((step, index) => {
        const status = getStatus(step, index, currentStepIndex, stepStatuses);
        const config = statusConfig[status];
        const Icon = config.icon;
        const isLast = index === steps.length - 1;

        return (
          <Group key={step.id} gap={0} wrap="nowrap" style={{ flex: 1 }}>
            <Stack align="center" gap={4} style={{ minWidth: 80 }}>
              <ThemeIcon
                size={32}
                radius="xl"
                color={config.color}
                variant={status === "active" ? "filled" : "light"}
                style={
                  status === "active"
                    ? { animation: "pulse 2s ease-in-out infinite" }
                    : undefined
                }
              >
                <Icon size={16} />
              </ThemeIcon>
              <Text size="xs" fw={status === "active" ? 600 : 400} ta="center">
                {step.label}
              </Text>
              {step.description && (
                <Text size="xs" c="dimmed" ta="center">
                  {step.description}
                </Text>
              )}
              {showElapsedTime && status === "active" && <ElapsedTimer />}
            </Stack>
            {!isLast && (
              <Box
                h={2}
                style={{
                  flex: 1,
                  minWidth: 20,
                  backgroundColor:
                    status === "complete"
                      ? "var(--mantine-color-green-5)"
                      : "var(--mantine-color-gray-3)",
                }}
              />
            )}
          </Group>
        );
      })}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </Group>
  );
}
