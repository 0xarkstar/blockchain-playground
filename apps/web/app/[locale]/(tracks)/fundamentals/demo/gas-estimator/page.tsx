import { useTranslations } from "next-intl";
import { Container, Title, Text, Stack, Badge, Group, Breadcrumbs, Anchor, Paper } from "@mantine/core";
import { GasEstimatorDemo } from "../../../../../../components/fundamentals/gas-estimator-demo";

export default function GasEstimatorPage() {
  const t = useTranslations("fundamentals.demos.gasEstimator");
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Breadcrumbs>
          <Anchor href="../..">Fundamentals</Anchor>
          <Text>{t("title")}</Text>
        </Breadcrumbs>
        <div>
          <Group gap="xs" mb="xs">
            <Badge variant="light" color="red">Advanced</Badge>
            <Badge variant="light" color="violet">On-Chain</Badge>
          </Group>
          <Title order={1}>{t("title")}</Title>
          <Text size="lg" c="dimmed" mt="xs">{t("description")}</Text>
        </div>
        <Paper p="lg" radius="md" withBorder>
          <GasEstimatorDemo />
        </Paper>
      </Stack>
    </Container>
  );
}
