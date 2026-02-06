"use client";

import {
  Container,
  Title,
  Text,
  Badge,
  Stack,
  Group,
  Paper,
  Breadcrumbs,
  Anchor,
} from "@mantine/core";
import type { ReactNode } from "react";

interface DemoLayoutProps {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  trackTitle: string;
  trackHref: string;
  onChain?: boolean;
  children: ReactNode;
}

const difficultyColors = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "red",
} as const;

export function DemoLayout({
  title,
  description,
  difficulty,
  trackTitle,
  trackHref,
  onChain = false,
  children,
}: DemoLayoutProps) {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Breadcrumbs>
          <Anchor href={trackHref}>{trackTitle}</Anchor>
          <Text>{title}</Text>
        </Breadcrumbs>

        <div>
          <Group gap="xs" mb="xs">
            <Badge variant="light" color={difficultyColors[difficulty]}>
              {difficulty}
            </Badge>
            {onChain && (
              <Badge variant="light" color="violet">
                On-Chain
              </Badge>
            )}
          </Group>
          <Title order={1}>{title}</Title>
          <Text size="lg" c="dimmed" mt="xs">
            {description}
          </Text>
        </div>

        <Paper p="lg" radius="md" withBorder>
          {children}
        </Paper>
      </Stack>
    </Container>
  );
}
