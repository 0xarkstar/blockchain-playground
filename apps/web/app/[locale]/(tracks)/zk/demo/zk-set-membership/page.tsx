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
import { ZKSetMembershipDemo } from "../../../../../../components/zk/zk-set-membership-demo";

export default function ZKSetMembershipPage() {
  const t = useTranslations("zk.demos.zkSetMembership");
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Breadcrumbs>
          <Anchor href="../..">ZK Proofs</Anchor>
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
          <ZKSetMembershipDemo />
        </Paper>
      </Stack>
    </Container>
  );
}
