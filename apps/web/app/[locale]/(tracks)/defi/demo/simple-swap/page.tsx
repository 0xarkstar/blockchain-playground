import { useTranslations } from "next-intl";
import { Container, Title, Text, Stack, Badge, Group, Breadcrumbs, Anchor, Paper } from "@mantine/core";
import { SimpleSwapDemo } from "../../../../../../components/defi/simple-swap-demo";

export default function SimpleSwapPage() {
  const t = useTranslations("defi.demos.simpleSwap");
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
          <SimpleSwapDemo />
        </Paper>
      </Stack>
    </Container>
  );
}
