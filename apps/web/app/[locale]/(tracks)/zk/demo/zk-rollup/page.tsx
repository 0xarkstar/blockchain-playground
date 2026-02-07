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
import { ZKRollupDemo } from "../../../../../../components/zk/zk-rollup-demo";

export default function ZKRollupPage() {
  const t = useTranslations("zk.demos.zkRollup");
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Breadcrumbs>
          <Anchor href="../..">ZK Proofs</Anchor>
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
          <ZKRollupDemo />
        </Paper>
      </Stack>
    </Container>
  );
}
