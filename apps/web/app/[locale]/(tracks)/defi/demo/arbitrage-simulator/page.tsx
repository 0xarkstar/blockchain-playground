import { useTranslations } from "next-intl";
import { Container, Title, Text, Stack, Badge, Group, Breadcrumbs, Anchor, Paper } from "@mantine/core";
import { ArbitrageSimulatorDemo } from "../../../../../../components/defi/arbitrage-simulator-demo";

export default function ArbitrageSimulatorPage() {
  const t = useTranslations("defi.demos.arbitrageSimulator");
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Breadcrumbs>
          <Anchor href="../..">DeFi</Anchor>
          <Text>{t("title")}</Text>
        </Breadcrumbs>
        <div>
          <Group gap="xs" mb="xs">
            <Badge variant="light" color="yellow">Intermediate</Badge>
          </Group>
          <Title order={1}>{t("title")}</Title>
          <Text size="lg" c="dimmed" mt="xs">{t("description")}</Text>
        </div>
        <Paper p="lg" radius="md" withBorder>
          <ArbitrageSimulatorDemo />
        </Paper>
      </Stack>
    </Container>
  );
}
