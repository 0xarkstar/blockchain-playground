import { useTranslations } from "next-intl";
import { Container, Title, Text, Stack, Badge, Group, Breadcrumbs, Anchor, Paper } from "@mantine/core";
import { ImpermanentLossDemo } from "../../../../../../components/defi/impermanent-loss-demo";

export default function ImpermanentLossPage() {
  const t = useTranslations("defi.demos.impermanentLoss");
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Breadcrumbs>
          <Anchor href="../..">DeFi</Anchor>
          <Text>{t("title")}</Text>
        </Breadcrumbs>
        <div>
          <Group gap="xs" mb="xs">
            <Badge variant="light" color="green">Beginner</Badge>
          </Group>
          <Title order={1}>{t("title")}</Title>
          <Text size="lg" c="dimmed" mt="xs">{t("description")}</Text>
        </div>
        <Paper p="lg" radius="md" withBorder>
          <ImpermanentLossDemo />
        </Paper>
      </Stack>
    </Container>
  );
}
