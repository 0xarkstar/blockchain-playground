"use client";

import { Paper, Group, Stack, Text, List, ThemeIcon, Box } from "@mantine/core";

interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
  details?: string[];
  isLast?: boolean;
  color?: string;
}

export function StepCard({
  stepNumber,
  title,
  description,
  details,
  isLast = false,
  color = "blue",
}: StepCardProps) {
  return (
    <Box pos="relative">
      <Group align="flex-start" gap="md" wrap="nowrap">
        <Stack align="center" gap={0}>
          <ThemeIcon size={36} radius="xl" color={color} variant="filled">
            <Text size="sm" fw={700} c="white">
              {stepNumber}
            </Text>
          </ThemeIcon>
          {!isLast && (
            <Box
              w={2}
              style={{
                flexGrow: 1,
                minHeight: 24,
                backgroundColor: `var(--mantine-color-${color}-3)`,
              }}
            />
          )}
        </Stack>

        <Paper p="sm" style={{ flex: 1 }}>
          <Stack gap="xs">
            <Text fw={600} size="sm">
              {title}
            </Text>
            <Text size="sm" c="dimmed">
              {description}
            </Text>
            {details && details.length > 0 && (
              <List size="sm" spacing="xs">
                {details.map((detail) => (
                  <List.Item key={detail}>{detail}</List.Item>
                ))}
              </List>
            )}
          </Stack>
        </Paper>
      </Group>
    </Box>
  );
}
