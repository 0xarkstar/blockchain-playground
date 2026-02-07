import { useTranslations } from "next-intl";
import { Container, Title, Text, Stack, Badge, Group, Breadcrumbs, Anchor, Paper } from "@mantine/core";
import { ProxyPatternsDemo } from "../../../../../../components/solidity/proxy-patterns-demo";

export default function ProxyPatternsPage() {
  const t = useTranslations("solidity.demos.proxyPatterns");
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Breadcrumbs>
          <Anchor href="../..">Solidity</Anchor>
          <Text>{t("title")}</Text>
        </Breadcrumbs>
        <div>
          <Group gap="xs" mb="xs">
            <Badge variant="light" color="red">Advanced</Badge>
          </Group>
          <Title order={1}>{t("title")}</Title>
          <Text size="lg" c="dimmed" mt="xs">{t("description")}</Text>
        </div>
        <Paper p="lg" radius="md" withBorder>
          <ProxyPatternsDemo />
        </Paper>
      </Stack>
    </Container>
  );
}
