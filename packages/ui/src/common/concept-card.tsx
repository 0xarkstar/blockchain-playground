"use client";

import { Card, Title, Text, Badge, Group, Stack } from "@mantine/core";
import type { ReactNode } from "react";

interface ConceptCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  badge?: string;
  badgeColor?: string;
  href?: string;
  onClick?: () => void;
}

export function ConceptCard({
  title,
  description,
  icon,
  badge,
  badgeColor = "blue",
  href,
  onClick,
}: ConceptCardProps) {
  const content = (
    <Stack gap="sm">
      <Group justify="space-between">
        <Group gap="sm">
          {icon}
          <Title order={4}>{title}</Title>
        </Group>
        {badge && (
          <Badge variant="light" color={badgeColor}>
            {badge}
          </Badge>
        )}
      </Group>
      <Text size="sm" c="dimmed">
        {description}
      </Text>
    </Stack>
  );

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      component={href ? "a" : "div"}
      href={href}
      onClick={onClick}
      style={href || onClick ? { cursor: "pointer" } : undefined}
    >
      {content}
    </Card>
  );
}
