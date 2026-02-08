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
import { HashPreimageDemo } from "../../../../../../components/applied-zk/hash-preimage-demo";

export default function HashPreimagePage() {
  const t = useTranslations("appliedZk.demos.hashPreimage");
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Breadcrumbs>
          <Anchor href="../..">Applied ZK</Anchor>
          <Text>{t("title")}</Text>
        </Breadcrumbs>
        <div>
          <Group gap="xs" mb="xs">
            <Badge variant="light" color="green">
              Beginner
            </Badge>
          </Group>
          <Title order={1}>{t("title")}</Title>
          <Text size="lg" c="dimmed" mt="xs">
            {t("description")}
          </Text>
        </div>
        <Paper p="lg" radius="md" withBorder>
          <HashPreimageDemo />
        </Paper>
      </Stack>
    </Container>
  );
}
