"use client";

import { Accordion, Alert, List, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconInfoCircle, IconBulb, IconListCheck } from "@tabler/icons-react";
import { StepCard } from "./step-card";

interface EducationStep {
  title: string;
  description: string;
  details?: string[];
}

interface EducationPanelProps {
  howItWorks?: EducationStep[];
  whyItMatters?: string;
  tips?: string[];
  defaultExpanded?: boolean;
}

export function EducationPanel({
  howItWorks,
  whyItMatters,
  tips,
  defaultExpanded = false,
}: EducationPanelProps) {
  const defaultValue = defaultExpanded
    ? ["how-it-works", "why-it-matters", "tips"].filter((key) => {
        if (key === "how-it-works") return howItWorks && howItWorks.length > 0;
        if (key === "why-it-matters") return !!whyItMatters;
        if (key === "tips") return tips && tips.length > 0;
        return false;
      })
    : [];

  const hasContent =
    (howItWorks && howItWorks.length > 0) ||
    whyItMatters ||
    (tips && tips.length > 0);

  if (!hasContent) return null;

  return (
    <Accordion multiple defaultValue={defaultValue} variant="separated">
      {howItWorks && howItWorks.length > 0 && (
        <Accordion.Item value="how-it-works">
          <Accordion.Control
            icon={
              <ThemeIcon variant="light" color="blue" size="sm">
                <IconListCheck size={14} />
              </ThemeIcon>
            }
          >
            <Text fw={600} size="sm">
              How It Works
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              {howItWorks.map((step, index) => (
                <StepCard
                  key={step.title}
                  stepNumber={index + 1}
                  title={step.title}
                  description={step.description}
                  details={step.details}
                  isLast={index === howItWorks.length - 1}
                />
              ))}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      )}

      {whyItMatters && (
        <Accordion.Item value="why-it-matters">
          <Accordion.Control
            icon={
              <ThemeIcon variant="light" color="teal" size="sm">
                <IconInfoCircle size={14} />
              </ThemeIcon>
            }
          >
            <Text fw={600} size="sm">
              Why It Matters
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Alert
              icon={<IconInfoCircle size={16} />}
              color="teal"
              variant="light"
            >
              {whyItMatters}
            </Alert>
          </Accordion.Panel>
        </Accordion.Item>
      )}

      {tips && tips.length > 0 && (
        <Accordion.Item value="tips">
          <Accordion.Control
            icon={
              <ThemeIcon variant="light" color="yellow" size="sm">
                <IconBulb size={14} />
              </ThemeIcon>
            }
          >
            <Text fw={600} size="sm">
              Tips
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <List
              spacing="xs"
              size="sm"
              icon={
                <ThemeIcon color="yellow" variant="light" size={20} radius="xl">
                  <IconBulb size={12} />
                </ThemeIcon>
              }
            >
              {tips.map((tip) => (
                <List.Item key={tip}>{tip}</List.Item>
              ))}
            </List>
          </Accordion.Panel>
        </Accordion.Item>
      )}
    </Accordion>
  );
}
