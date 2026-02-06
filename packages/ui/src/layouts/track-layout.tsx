"use client";

import {
  Container,
  Title,
  Text,
  Tabs,
  Stack,
  Badge,
  Group,
} from "@mantine/core";
import { IconBook, IconPlayerPlay } from "@tabler/icons-react";
import type { ReactNode } from "react";

interface TrackLayoutProps {
  title: string;
  description: string;
  demoCount: number;
  moduleCount: number;
  children: ReactNode;
  theoryTab?: ReactNode;
  demoTab?: ReactNode;
}

export function TrackLayout({
  title,
  description,
  demoCount,
  moduleCount,
  children,
  theoryTab,
  demoTab,
}: TrackLayoutProps) {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>{title}</Title>
          <Text size="lg" c="dimmed" mt="xs">
            {description}
          </Text>
          <Group mt="sm" gap="xs">
            <Badge variant="light" color="blue">
              {demoCount} Demos
            </Badge>
            <Badge variant="light" color="green">
              {moduleCount} Modules
            </Badge>
          </Group>
        </div>

        {theoryTab || demoTab ? (
          <Tabs defaultValue="demos">
            <Tabs.List>
              <Tabs.Tab
                value="demos"
                leftSection={<IconPlayerPlay size={16} />}
              >
                Demos
              </Tabs.Tab>
              <Tabs.Tab value="theory" leftSection={<IconBook size={16} />}>
                Theory
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="demos" pt="md">
              {demoTab ?? children}
            </Tabs.Panel>
            <Tabs.Panel value="theory" pt="md">
              {theoryTab}
            </Tabs.Panel>
          </Tabs>
        ) : (
          children
        )}
      </Stack>
    </Container>
  );
}
