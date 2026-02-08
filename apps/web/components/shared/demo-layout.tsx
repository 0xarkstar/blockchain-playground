"use client";

import { type ReactNode } from "react";
import { Stack, Grid, Tabs, Badge, Group, Paper, Text } from "@mantine/core";

interface DemoLayoutProps {
  title?: string;
  description?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  techStack?: string[];
  inputPanel: ReactNode;
  resultPanel: ReactNode;
  learnContent?: ReactNode;
  detailsContent?: ReactNode;
  onChainContent?: ReactNode;
}

const difficultyColors: Record<string, string> = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "red",
};

export function DemoLayout({
  title,
  description,
  difficulty,
  techStack,
  inputPanel,
  resultPanel,
  learnContent,
  detailsContent,
  onChainContent,
}: DemoLayoutProps) {
  const hasHeader = title || difficulty || (techStack && techStack.length > 0);
  const hasTabs = learnContent || detailsContent || onChainContent;

  const interactiveContent = (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, md: 6 }}>{inputPanel}</Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>{resultPanel}</Grid.Col>
    </Grid>
  );

  return (
    <Stack gap="lg">
      {hasHeader && (
        <Paper p="md" withBorder>
          <Stack gap="xs">
            {title && (
              <Text size="lg" fw={700}>
                {title}
              </Text>
            )}
            {description && (
              <Text size="sm" c="dimmed">
                {description}
              </Text>
            )}
            <Group gap="xs">
              {difficulty && (
                <Badge
                  color={difficultyColors[difficulty]}
                  variant="light"
                  size="sm"
                >
                  {difficulty}
                </Badge>
              )}
              {techStack?.map((tech) => (
                <Badge key={tech} variant="outline" size="sm">
                  {tech}
                </Badge>
              ))}
            </Group>
          </Stack>
        </Paper>
      )}

      {hasTabs ? (
        <Tabs defaultValue="interactive">
          <Tabs.List>
            <Tabs.Tab value="interactive">Interactive</Tabs.Tab>
            {learnContent && <Tabs.Tab value="learn">Learn</Tabs.Tab>}
            {detailsContent && <Tabs.Tab value="details">Details</Tabs.Tab>}
            {onChainContent && <Tabs.Tab value="on-chain">On-Chain</Tabs.Tab>}
          </Tabs.List>

          <Tabs.Panel value="interactive" pt="md">
            {interactiveContent}
          </Tabs.Panel>
          {learnContent && (
            <Tabs.Panel value="learn" pt="md">
              {learnContent}
            </Tabs.Panel>
          )}
          {detailsContent && (
            <Tabs.Panel value="details" pt="md">
              {detailsContent}
            </Tabs.Panel>
          )}
          {onChainContent && (
            <Tabs.Panel value="on-chain" pt="md">
              {onChainContent}
            </Tabs.Panel>
          )}
        </Tabs>
      ) : (
        interactiveContent
      )}
    </Stack>
  );
}
