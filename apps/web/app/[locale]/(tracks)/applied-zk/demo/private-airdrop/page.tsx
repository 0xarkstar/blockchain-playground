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

const PrivateAirdropDemo = dynamic(
  () =>
    import("../../../../../../components/applied-zk/private-airdrop-demo").then(
      (m) => m.PrivateAirdropDemo,
    ),
  { ssr: false },
);

export default function PrivateAirdropPage() {
  const t = useTranslations("appliedZk.demos.privateAirdrop");
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Breadcrumbs>
          <Anchor href="../..">Applied ZK</Anchor>
          <Text>{t("title")}</Text>
        </Breadcrumbs>
        <div>
          <Group gap="xs" mb="xs">
            <Badge variant="light" color="red">
              Advanced
            </Badge>
          </Group>
          <Title order={1}>{t("title")}</Title>
          <Text size="lg" c="dimmed" mt="xs">
            {t("description")}
          </Text>
        </div>
        <Paper p="lg" radius="md" withBorder>
          <PrivateAirdropDemo />
        </Paper>
      </Stack>
    </Container>
  );
}
