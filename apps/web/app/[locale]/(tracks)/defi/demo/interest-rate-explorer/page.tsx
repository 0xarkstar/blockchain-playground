import { useTranslations } from "next-intl";
import { Container, Title, Text, Stack, Badge, Group, Breadcrumbs, Anchor, Paper } from "@mantine/core";
import { InterestRateExplorerDemo } from "../../../../../../components/defi/interest-rate-explorer-demo";

export default function InterestRateExplorerPage() {
  const t = useTranslations("defi.demos.interestRateExplorer");
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
          <InterestRateExplorerDemo />
        </Paper>
      </Stack>
    </Container>
  );
}
