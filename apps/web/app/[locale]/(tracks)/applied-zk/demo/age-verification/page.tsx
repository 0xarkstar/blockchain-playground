"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import {
  Container,
  Title,
  Text,
  Stack,
  Badge,
  Group,
  Breadcrumbs,
  Anchor,
  Paper,
} from "@mantine/core";

const AgeVerificationDemo = dynamic(
  () =>
    import("../../../../../../components/applied-zk/age-verification-demo").then(
      (m) => m.AgeVerificationDemo,
    ),
  { ssr: false },
);

export default function AgeVerificationPage() {
  const t = useTranslations("appliedZk.demos.ageVerification");
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Breadcrumbs>
          <Anchor href="../..">Applied ZK</Anchor>
          <Text>{t("title")}</Text>
        </Breadcrumbs>
        <div>
          <Group gap="xs" mb="xs">
            <Badge variant="light" color="yellow">
              Intermediate
            </Badge>
          </Group>
          <Title order={1}>{t("title")}</Title>
          <Text size="lg" c="dimmed" mt="xs">
            {t("description")}
          </Text>
        </div>
        <Paper p="lg" radius="md" withBorder>
          <AgeVerificationDemo />
        </Paper>
      </Stack>
    </Container>
  );
}
